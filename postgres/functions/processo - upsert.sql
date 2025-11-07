CREATE OR REPLACE FUNCTION upsert_process(p_data JSONB)
RETURNS JSONB AS
$$
DECLARE
    v_proc_id BIGINT;
    v_proc_numero TEXT;
    v_user_id BIGINT;
    v_anexo_id BIGINT;
    v_anexo_numero TEXT;
    v_user_nome TEXT;
    v_user_cpf TEXT;
    v_msg TEXT;
BEGIN
    -- ==========================
    -- EXTRAI CAMPOS DO JSON
    -- ==========================
    v_proc_id := NULLIF(p_data->>'id', '')::BIGINT;
    v_proc_numero := p_data->>'numero';
    v_user_id := NULLIF(p_data->'usuario'->>'id', '')::BIGINT;
    v_anexo_id := NULLIF(p_data->'anexo'->>'id', '')::BIGINT;
    v_anexo_numero := p_data->'anexo'->>'numero';

    -- ==========================
    -- VALIDA USUÁRIO
    -- ==========================
    SELECT u.nome, u.cpf_cnpj
    INTO v_user_nome, v_user_cpf
    FROM usuario u
    WHERE u.id = v_user_id;

    IF v_user_nome IS NULL THEN
        RETURN jsonb_build_object(
            'status', 'erro',
            'mensagem', format('Usuário com id=%s não encontrado', v_user_id),
            'object', NULL
        );
    END IF;

    -- ==========================
    -- INSERE ANEXO SE NÃO EXISTIR
    -- ==========================
    IF v_anexo_id IS NULL THEN
        INSERT INTO anexo (numero)
        VALUES (v_anexo_numero)
        RETURNING id, numero INTO v_anexo_id, v_anexo_numero;

        v_msg := format('Anexo com id=%s criado com sucesso.', v_anexo_id);
    ELSE
        -- Apenas busca o número atual do anexo para retornar
        SELECT numero
        INTO v_anexo_numero
        FROM anexo
        WHERE id = v_anexo_id;
    END IF;

    -- ==========================
    -- INSERE OU ATUALIZA PROCESSO
    -- ==========================
    IF v_proc_id IS NULL THEN
        INSERT INTO processo (numero, anexo, usuario)
        VALUES (v_proc_numero, v_anexo_id, v_user_id)
        RETURNING id INTO v_proc_id;

        v_msg := format('Processo com id=%s criado com sucesso.', v_proc_id);
    ELSE
        UPDATE processo
        SET numero = v_proc_numero,
            anexo = v_anexo_id,
            usuario = v_user_id
        WHERE id = v_proc_id
        RETURNING id INTO v_proc_id;

        v_msg := format('Processo com id=%s atualizado com sucesso.', v_proc_id);
    END IF;

    -- ==========================
    -- RETORNO JSON PADRONIZADO
    -- ==========================
    RETURN jsonb_build_object(
        'status', 'sucesso',
        'mensagem', v_msg,
        'object', jsonb_build_object(
            'id', v_proc_id,
            'numero', v_proc_numero,
            'usuario', jsonb_build_object(
                'id', v_user_id,
                'nome', v_user_nome,
                'cpfCnpj', v_user_cpf
            ),
            'anexo', jsonb_build_object(
                'id', v_anexo_id,
                'numero', v_anexo_numero
            )
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'status', 'erro',
            'mensagem', format('Erro ao salvar processo: %s', SQLERRM),
            'object', NULL
        );
END;
$$
LANGUAGE plpgsql;