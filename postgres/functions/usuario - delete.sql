CREATE OR REPLACE FUNCTION delete_user_by_id(user_id INT)
RETURNS JSONB AS
$$
DECLARE
    _deleted RECORD;
BEGIN
    -- ✅ Validação de parâmetro nulo com retorno JSON padronizado
    IF user_id IS NULL THEN
        RETURN jsonb_build_object(
            'status', 'erro',
            'mensagem', 'O parâmetro id é obrigatório para deletar um usuário.',
            'object', NULL
        );
    END IF;

    -- ✅ Deleta e captura o registro removido
    DELETE FROM usuario u
    WHERE u.id = user_id
    RETURNING u.id, u.nome, u.cpf_cnpj INTO _deleted;

    -- ✅ Caso o usuário não seja encontrado
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'status', 'erro',
            'mensagem', format('Usuário com id=%s não encontrado.', user_id),
            'object', NULL
        );
    END IF;

    -- ✅ Retorna sucesso e o objeto deletado
    RETURN jsonb_build_object(
        'status', 'sucesso',
        'mensagem', format('Usuário com id=%s deletado com sucesso.', user_id),
        'object', jsonb_build_object(
            'id', _deleted.id,
            'nome', _deleted.nome,
            'cpfCnpj', _deleted.cpf_cnpj
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        -- ✅ Captura qualquer outro erro (como violação de chave estrangeira)
        RETURN jsonb_build_object(
            'status', 'erro',
            'mensagem', SQLERRM,
            'object', jsonb_build_object('id', user_id)
        );
END;
$$
LANGUAGE plpgsql;