CREATE OR REPLACE FUNCTION upsert_user (_data JSONB)
RETURNS JSONB AS
$$
DECLARE
    _id INT;
    _nome TEXT;
    _cpfCnpj TEXT;
    _exists RECORD;
    _msg TEXT;
BEGIN
    -- Extrai campos do JSON
    _id := NULLIF(_data->>'id', '')::INT;
    _nome := _data->>'nome';
    _cpfCnpj := _data->>'cpfCnpj';

    -- Verifica se já existe pelo id ou cpf_cnpj
    SELECT u.id, u.nome, u.cpf_cnpj
    INTO _exists
    FROM usuario u
    WHERE ( _id IS NOT NULL AND u.id = _id )
       OR ( u.cpf_cnpj = _cpfCnpj )
    LIMIT 1;

    IF FOUND THEN
        -- Atualiza o usuário existente
        UPDATE usuario u
        SET nome = _nome,
            cpf_cnpj = _cpfCnpj
        WHERE u.id = _exists.id
        RETURNING u.id INTO _id;

        _msg := format('Usuário com id=%s atualizado com sucesso.', _id);

    ELSE
        -- Cria novo usuário
        INSERT INTO usuario (nome, cpf_cnpj)
        VALUES (_nome, _cpfCnpj)
        RETURNING id INTO _id;

        _msg := format('Usuário com id=%s criado com sucesso.', _id);
    END IF;

    -- Retorna JSON padronizado
    RETURN jsonb_build_object(
        'status', 'sucesso',
        'mensagem', _msg,
        'object', jsonb_build_object(
            'id', _id,
            'nome', _nome,
            'cpfCnpj', _cpfCnpj
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'status', 'erro',
            'mensagem', format('Erro ao salvar usuário: %s', SQLERRM),
            'object', NULL
        );
END;
$$
LANGUAGE plpgsql;
