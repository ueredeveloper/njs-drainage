
-- Busca todos os Estados do Brasil

CREATE OR REPLACE FUNCTION fetch_all_states ()
RETURNS json AS $$
BEGIN
    RETURN (
        SELECT json_agg(
            json_build_object(
                'id', _est.id,
                'descricao', _est.descricao
            )
        )
        FROM estado _est
    );
END;
$$ LANGUAGE plpgsql;


select fetch_all_states()