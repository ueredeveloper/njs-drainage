CREATE OR REPLACE FUNCTION upsert_address(address JSONB)
RETURNS JSONB AS
$$
DECLARE
    v_state_id BIGINT;
    v_address_id BIGINT;
    v_result JSONB;
    v_msg TEXT;
BEGIN
    -- 0. Validação obrigatória: Estado
    v_state_id := NULLIF(TRIM(address->'estado'->>'id'), '')::BIGINT;
    IF v_state_id IS NULL THEN
        RAISE EXCEPTION 'É obrigatório informar o Estado!';
    END IF;

    -- 1. Verificar se o endereço já existe
    v_address_id := NULLIF(TRIM(address->>'id'), '')::BIGINT;

    IF v_address_id IS NOT NULL AND EXISTS (SELECT 1 FROM endereco WHERE id = v_address_id) THEN
        -- Atualizar endereço existente
        UPDATE endereco
        SET
            logradouro = address->>'logradouro',
            bairro = address->>'bairro',
            cidade = address->>'cidade',
            cep = address->>'cep',
            estado = v_state_id
        WHERE id = v_address_id;

        v_msg := format('Endereço com id=%s atualizado com sucesso.', v_address_id);
    ELSE
        -- Inserir novo endereço
        INSERT INTO endereco (logradouro, bairro, cidade, cep, estado)
        VALUES (
            address->>'logradouro',
            address->>'bairro',
            address->>'cidade',
            address->>'cep',
            v_state_id
        )
        RETURNING id INTO v_address_id;

        v_msg := format('Endereço com id=%s criado com sucesso.', v_address_id);
    END IF;

    -- 2. Obter dados completos do endereço
    SELECT jsonb_build_object(
               'id', e.id,
               'logradouro', e.logradouro,
               'bairro', e.bairro,
               'cidade', e.cidade,
               'cep', e.cep,
               'estado', jsonb_build_object(
                   'id', es.id,
                   'descricao', es.descricao
               )
           )
    INTO v_result
    FROM endereco e
    LEFT JOIN estado es ON es.id = e.estado
    WHERE e.id = v_address_id;

    -- 3. Retornar JSON padronizado
    RETURN jsonb_build_object(
        'status', 'sucesso',
        'mensagem', v_msg,
        'object', v_result
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'status', 'erro',
            'mensagem', format('Erro ao salvar endereço: %s', SQLERRM),
            'object', NULL
        );
END;
$$
LANGUAGE plpgsql;