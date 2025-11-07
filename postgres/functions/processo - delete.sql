CREATE OR REPLACE FUNCTION delete_process (p_id INTEGER)
RETURNS JSONB AS
$$
DECLARE
    v_result JSONB;
BEGIN
    -- 1️⃣ Retorna o processo antes de deletar (para confirmar o que será removido)
    SELECT jsonb_build_object(
            'id', p.id,
            'numero', p.numero,
            'usuario', jsonb_build_object(
                'id', u.id,
                'nome', u.nome,
                'cpfCnpj', u.cpf_cnpj
            )
        )
    INTO v_result
    FROM processo p
    JOIN usuario u ON u.id = p.usuario
    WHERE p.id = p_id;

    -- 2️⃣ Se não encontrar o processo
    IF v_result IS NULL THEN
        RETURN jsonb_build_object(
            'status', 'erro',
            'mensagem', format('Processo com id=%s não encontrado', p_id),
            'object', NULL
        );
    END IF;

    -- 3️⃣ Deleta o processo
    DELETE FROM processo WHERE id = p_id;

    -- 4️⃣ Retorna o JSON padronizado
    RETURN jsonb_build_object(
        'status', 'sucesso',
        'mensagem', format('Processo com id=%s deletado com sucesso.', p_id),
        'object', v_result
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'status', 'erro',
            'mensagem', format('Erro ao deletar processo: %s', SQLERRM),
            'object', NULL
        );
END;
$$
LANGUAGE plpgsql;