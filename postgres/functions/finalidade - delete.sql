CREATE OR REPLACE FUNCTION delete_purpose(p_id INTEGER)
RETURNS JSON AS $$
DECLARE
    v_purpose RECORD;
    v_result JSON;
BEGIN
    -- Busca o registro antes de deletar
    SELECT *
    INTO v_purpose
    FROM finalidade
    WHERE id = p_id;

    -- Caso não exista, retorna mensagem de erro
    IF NOT FOUND THEN
        RETURN json_build_object(
            'status', 'erro',
            'message', format('Não há finalidade com id = %s', p_id),
            'object', NULL
        );
    END IF;

    -- Deleta o registro
    DELETE FROM finalidade WHERE id = p_id;

    -- Retorna mensagem de sucesso com o objeto deletado
    v_result := json_build_object(
        'status', 'sucesso',
        'message', 'Finalidade deletad com sucesso.',
        'object', json_build_object(
          'id', v_purpose.id, 
          'finalidade', v_purpose.finalidade
          )
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

select * from delete_purpose(4)