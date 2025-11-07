CREATE OR REPLACE FUNCTION delete_document(doc_id BIGINT)
RETURNS JSON AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    BEGIN
        -- 🔍 Verificar se o documento existe
        SELECT EXISTS(SELECT 1 FROM documento WHERE id = doc_id) INTO v_exists;

        IF NOT v_exists THEN
            RETURN json_build_object(
                'status', 'error',
                'mensagem', format('Documento %s não encontrado.', doc_id),
                'object', NULL
            );
        END IF;

        -- 🧹 Remover relacionamentos e o documento
        DELETE FROM usuario_documento WHERE documento_id = doc_id;
        DELETE FROM documento WHERE id = doc_id;

        RETURN json_build_object(
            'status', 'success',
            'mensagem', format('Documento %s e seus relacionamentos foram deletados com sucesso.', doc_id),
            'object', json_build_object('id', doc_id)
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'error',
            'mensagem', SQLERRM,
            'object', NULL
        );
    END;
END;
$$ LANGUAGE plpgsql;