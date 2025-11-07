CREATE OR REPLACE FUNCTION delete_attachment(p_id INTEGER)
RETURNS JSONB AS
$$
DECLARE
    v_result JSONB;
BEGIN
    -- 1️⃣ Retorna o anexo antes de deletar (para confirmar o que será removido)
    SELECT jsonb_build_object(
            'id', a.id,
            'numero', a.numero
        )
    INTO v_result
    FROM anexo a
    WHERE a.id = p_id;

    -- 2️⃣ Se não encontrar o anexo
    IF v_result IS NULL THEN
        RETURN jsonb_build_object(
            'status', 'erro',
            'mensagem', format('Anexo com id=%s não encontrado.', p_id),
            'object', NULL
        );
    END IF;

    -- 3️⃣ Deleta o anexo
    DELETE FROM anexo WHERE id = p_id;

    -- 4️⃣ Retorna o JSON padronizado
    RETURN jsonb_build_object(
        'status', 'sucesso',
        'mensagem', format('Anexo com id=%s deletado com sucesso.', p_id),
        'object', v_result
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'status', 'erro',
            'mensagem', format('Erro ao deletar anexo: %s', SQLERRM),
            'object', NULL
        );
END;
$$
LANGUAGE plpgsql;