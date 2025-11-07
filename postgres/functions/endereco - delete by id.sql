create or replace function delete_address (end_id BIGINT) RETURNS JSON as $$
DECLARE
    v_result JSON;
    v_exists BOOLEAN;
BEGIN
    -- 🧩 1. Verifica se o endereço existe
    SELECT EXISTS(SELECT 1 FROM endereco WHERE id = end_id) INTO v_exists;

    IF NOT v_exists THEN
        RAISE EXCEPTION 'Endereço com id % não encontrado.', end_id;
    END IF;

    -- 🗂️ 2. Busca dados antes de deletar (para retornar ao final)
    SELECT json_build_object(
               'id', _end.id
           )
    INTO v_result
    FROM endereco _end
    WHERE _end.id = end_id;
  
    -- 🏠 4. Deleta o endereço em si
    DELETE FROM endereco WHERE id = end_id;

    -- ✅ 5. Retorna o JSON do endereço deletado
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;