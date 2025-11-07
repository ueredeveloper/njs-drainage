CREATE OR REPLACE FUNCTION search_process_by_param (param TEXT)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', p.id,
            'numero', p.numero,
            'anexo', json_build_object(
                'id', a.id,
                'numero', a.numero
            ),
            'usuario', json_build_object(
                'id', u.id,
                'nome', u.nome
            )
        )
    )
    INTO v_result
    FROM processo p
    LEFT JOIN anexo a ON a.id = p.anexo
    LEFT JOIN usuario u ON u.id = p.usuario
    WHERE lower(p.numero) LIKE lower('%' || param || '%')
       OR lower(a.numero) LIKE lower('%' || param || '%')
       OR lower(u.nome)   LIKE lower('%' || param || '%');

    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;