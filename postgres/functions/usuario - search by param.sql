CREATE OR REPLACE FUNCTION search_usuario_by_param (param TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', u.id,
            'nome', u.nome,
            'cpfCnpj', u.cpf_cnpj
        )
    )
    INTO result
    FROM usuario u
    WHERE LOWER(u.nome) LIKE LOWER('%' || param || '%') OR u.cpf_cnpj LIKE '%' || param || '%';
	
    RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;

--drop function search_usuario_by_name(p_name TEXT)

 select * from search_usuario_by_param('419635')
 select * from usuario

