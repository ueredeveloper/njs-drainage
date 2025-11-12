CREATE OR REPLACE FUNCTION delete_doc_user_relation(p_doc_id BIGINT, p_user_id BIGINT)
RETURNS JSON AS $$
DECLARE
    v_deleted_id BIGINT;
BEGIN
    BEGIN
        -- 🧩 Tenta deletar o relacionamento e retorna o documento_id
        DELETE FROM usuario_documento
        WHERE documento_id = p_doc_id
          AND usuario_id = p_user_id
        RETURNING documento_id INTO v_deleted_id;

        -- 🧭 Se não encontrou nada para deletar
        IF v_deleted_id IS NULL THEN
            RETURN json_build_object(
                'status', 'erro',
                'mensagem', format('Relação documento %s e usuário %s não encontrada.', p_doc_id, p_user_id),
                'object', NULL
            );
        END IF;

        -- ✅ Retorno de sucesso
        RETURN json_build_object(
            'status', 'success',
            'mensagem', 'Relação documento-usuário deletada com sucesso.',
            'object', json_build_object(
                'documento_id', v_deleted_id,
                'usuario_id', p_user_id
            )
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'erro',
            'mensagem', SQLERRM,
            'object', NULL
        );
    END;
END;
$$ LANGUAGE plpgsql;
