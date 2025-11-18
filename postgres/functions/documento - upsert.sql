CREATE OR REPLACE FUNCTION upsert_document (doc JSONB)
RETURNS JSON AS $$
DECLARE
    v_proc_id  BIGINT;
    v_doc_id   BIGINT;
    v_an_id    BIGINT;
    v_td_id    BIGINT;
    v_end_id   BIGINT;
    v_user JSONB;
    v_result JSON;
BEGIN
    -- Bloco principal com tratamento de exceção
    BEGIN
        -- 🧩 0. Validação obrigatória: tipoDocumento
        v_td_id := NULLIF(TRIM(doc->'tipoDocumento'->>'id'), '')::BIGINT;
        IF v_td_id IS NULL THEN
            RAISE EXCEPTION 'É obrigatório informar o tipo de documento!';
        END IF;

        -- 🧩 1. Validação obrigatória: endereço
        v_end_id := NULLIF(TRIM(doc->'endereco'->>'id'), '')::BIGINT;
        IF v_end_id IS NULL THEN
            RAISE EXCEPTION 'É obrigatório informar o endereço!';
        END IF;

        -- 📎 2. Verificar / criar ANEXO
        SELECT id INTO v_an_id
        FROM anexo
        WHERE numero = doc#>>'{processo,anexo,numero}';

        IF v_an_id IS NULL AND doc#>>'{processo,anexo,numero}' IS NOT NULL THEN
            INSERT INTO anexo (numero)
            VALUES (doc#>>'{processo,anexo,numero}')
            RETURNING id INTO v_an_id;
        END IF;

        -- 🧾 3. Verificar / criar PROCESSO
        SELECT id INTO v_proc_id
        FROM processo
        WHERE numero = doc#>>'{processo,numero}';

        IF v_proc_id IS NULL AND doc#>>'{processo,numero}' IS NOT NULL THEN
            INSERT INTO processo (numero, anexo)
            VALUES (doc#>>'{processo,numero}', v_an_id)
            RETURNING id INTO v_proc_id;
        END IF;

        -- 🔍 4. Verificar se o DOCUMENTO já existe
        v_doc_id := NULLIF(TRIM(doc->>'id'), '')::BIGINT;

        IF v_doc_id IS NOT NULL AND EXISTS (SELECT 1 FROM documento WHERE id = v_doc_id) THEN
            -- 📝 Atualizar documento existente
            UPDATE documento
            SET
                numero = doc->>'numero',
                numero_sei = doc->>'numeroSei',
                processo = v_proc_id,
                tipo_documento = v_td_id,
                endereco = v_end_id
            WHERE id = v_doc_id;
        ELSE
            -- ➕ Inserir novo documento
            INSERT INTO documento (numero, numero_sei, processo, tipo_documento, endereco)
            VALUES (
                doc->>'numero',
                doc->>'numeroSei',
                v_proc_id,
                v_td_id,
                v_end_id
            )
            RETURNING id INTO v_doc_id;
        END IF;

        -- 6️⃣ Associar usuários (many-to-many)
        IF jsonb_array_length(doc->'usuarios') > 0 THEN
            FOR v_user IN SELECT * FROM jsonb_array_elements(doc->'usuarios')
            LOOP
                IF v_user->>'id' IS NULL THEN
                    RAISE EXCEPTION 'Usuário sem ID informado no array!';
                END IF;

                INSERT INTO usuario_documento (documento_id, usuario_id)
                VALUES (v_doc_id, (v_user->>'id')::BIGINT)
                ON CONFLICT DO NOTHING;
            END LOOP;
        ELSE
            RAISE EXCEPTION 'É obrigatório informar pelo menos um usuário!';
        END IF;

        -- 🧠 5. Retornar documento criado/atualizado
        SELECT json_build_object(
            'status', 'sucesso',
            'mensagem', 'Documento salvo com sucesso!',
            'object', json_build_object(
                'id', _doc.id,
                'numero', _doc.numero,
                'numeroSei', _doc.numero_sei,
                'processo', json_build_object(
                    'id', _proc.id,
                    'numero', _proc.numero,
                    'anexo', json_build_object(
                        'id', _an.id,
                        'numero', _an.numero
                    )
                ),
                'endereco', json_build_object(
                    'id', _end.id,
                    'logradouro', _end.logradouro,
                    'bairro', _end.bairro

                ),
                'tipoDocumento', json_build_object(
                    'id', dt.id,
                    'descricao', dt.descricao
                )
            )
        )
        INTO v_result
        FROM documento _doc
        LEFT JOIN documento_tipo dt ON dt.id = _doc.tipo_documento
        LEFT JOIN endereco _end ON _end.id = _doc.endereco
        LEFT JOIN processo _proc ON _proc.id = _doc.processo
        LEFT JOIN anexo _an ON _an.id = _proc.anexo
        WHERE _doc.id = v_doc_id;

        RETURN v_result;

    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'erro',
            'mensagem', SQLERRM,
            'object', NULL
        );
    END;
END;
$$ LANGUAGE plpgsql;