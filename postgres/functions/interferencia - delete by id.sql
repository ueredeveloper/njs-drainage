CREATE OR REPLACE FUNCTION delete_interferencia(int_id INT)
RETURNS JSONB AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- 1️⃣ Verifica se a interferência existe
    SELECT EXISTS(SELECT 1 FROM interferencia _i WHERE _i.id = int_id)
    INTO v_exists;

    IF NOT v_exists THEN
        RETURN jsonb_build_object(
            'status', 'erro',
            'mensagem', format('Interferência com id %s não encontrada.', int_id),
            'object', NULL
        );
    END IF;

    BEGIN
        -- 2️⃣ Deleta demandas relacionadas
        DELETE FROM demanda _d
        WHERE _d.interferencia = int_id;

        -- 3️⃣ Deleta finalidades relacionadas
        DELETE FROM finalidade _f
        WHERE _f.interferencia = int_id;

        -- 4️⃣ Deleta subterrânea (filha)
        DELETE FROM subterranea _sub
        WHERE _sub.id = int_id;

        -- 5️⃣ Finalmente, deleta a interferência (pai)
        DELETE FROM interferencia _i
        WHERE _i.id = int_id;

        RETURN jsonb_build_object(
            'status', 'success',
            'mensagem', format('Interferência %s e seus registros relacionados foram deletados com sucesso.', int_id),
            'object', jsonb_build_object('id', int_id)
        );

    EXCEPTION
        WHEN OTHERS THEN
            RETURN jsonb_build_object(
                'status', 'erro',
                'mensagem', format('Erro ao deletar interferência %s: %s', int_id, SQLERRM),
                'object', NULL
            );
    END;
END;
$$ LANGUAGE plpgsql;