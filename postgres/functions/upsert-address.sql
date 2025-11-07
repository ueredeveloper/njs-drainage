-- Salvar um endereço novo ou edita um endereço se existir
CREATE OR REPLACE FUNCTION upsert_address(address JSONB)
RETURNS JSON AS $$
DECLARE
    v_state_id BIGINT;
    v_address_id BIGINT;
    v_result JSON;
BEGIN
    -- 0. Validação obrigatória: Estado
    v_state_id := NULLIF(TRIM(address->'estado'->>'id'), '')::BIGINT;
    IF v_state_id IS NULL THEN
        RAISE EXCEPTION 'É obrigatório informar o Estado!';
    END IF;

    -- 1. Verificar se o ENDEREÇO já existe
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
    END IF;

    -- 2. Retornar JSON do endereço atualizado ou inserido
    SELECT json_build_object(
               'id', _end.id,
               'logradouro', _end.logradouro,
               'bairro', _end.bairro,
               'cidade', _end.cidade,
               'cep', _end.cep,
               'estado', json_build_object(
                   'id', _est.id,
                   'descricao', _est.descricao
               )
           )
    INTO v_result
    FROM endereco _end
    LEFT JOIN estado _est ON _est.id = _end.estado
    WHERE _end.id = v_address_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;


-- Salva endereço novo quando não tem id e edita endereço com id
select
  upsert_address (
    '{
    
        "logradouro": "Rua das Palmeiras 555 33",
        "bairro": "Centro 5 3",
        "cidade": "Coração de Maria 53",
        "cep": "44250-005",
        "estado": { "id": 6 }
    }'::jsonb
  );
