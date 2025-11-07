CREATE OR REPLACE FUNCTION search_users_by_document_id (p_documento_id INTEGER)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT
        COALESCE(
            json_agg(
                json_build_object(
                    'id', _us.id,
                    'nome', _us.nome,
                    'cpfCnpj', _us.cpf_cnpj
                )
            ),
            '[]'::JSON
        )
    INTO v_result
    FROM usuario_documento _ud
    LEFT JOIN usuario _us ON _us.id = _ud.usuario_id
    WHERE _ud.documento_id = p_documento_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

select * from usuario_documento
select search_users_by_document_id(115)