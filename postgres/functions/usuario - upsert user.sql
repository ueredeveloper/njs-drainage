/**
  Salva e edita usuário. Se quiser salvar usuário com cpf_cnpj já cadastrado é enviado mensagem de erro. Porém é possível editar usuário já cadastrado.

*/

CREATE OR REPLACE FUNCTION test_upsert_user (_data JSONB)
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

    -- Se CPF/CNPJ já existir em outro usuário → ERRO
    SELECT id, nome
    INTO _exists
    FROM usuario
    WHERE cpf_cnpj = _cpfCnpj
      AND (_id IS NULL OR id <> _id)   -- impede duplicação
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'status', 'erro',
            'mensagem', format(
                'Já existe um usuário com cpfCnpj=%s (id=%s).',
                _cpfCnpj, _exists.id
            ),
            'object', NULL
        );
    END IF;

    -- Se ID foi enviado, tenta atualizar
    IF _id IS NOT NULL THEN

        UPDATE usuario
        SET nome = _nome,
            cpf_cnpj = _cpfCnpj
        WHERE id = _id
        RETURNING id INTO _id;

        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'status', 'erro',
                'mensagem', format('Usuário id=%s não encontrado.', _id),
                'object', NULL
            );
        END IF;

        _msg := format('Usuário com id=%s atualizado com sucesso.', _id);

    ELSE
        -- Insere novo
        INSERT INTO usuario (nome, cpf_cnpj)
        VALUES (_nome, _cpfCnpj)
        RETURNING id INTO _id;

        _msg := format('Usuário com id=%s criado com sucesso.', _id);
    END IF;

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
    WHEN unique_violation THEN
        RETURN jsonb_build_object(
            'status', 'erro',
            'mensagem', 'Violação de chave única: cpfCnpj já existe.',
            'object', NULL
        );

    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'status', 'erro',
            'mensagem', format('Erro ao salvar usuário: %s', SQLERRM),
            'object', NULL
        );
END;
$$
LANGUAGE plpgsql;
