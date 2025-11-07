CREATE OR REPLACE FUNCTION search_address_by_param (p_logradouro TEXT)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_agg(
            json_build_object(
                'id', _end.id,
                'logradouro', _end.logradouro,
                'bairro', _end.bairro,
                'cep', _end.cep,
                'cidade', _end.cidade,
                'estado', json_build_object(
                    'id', _est.id,
                    'descricao', _est.descricao
                )
            )
        )
        FROM endereco _end
        LEFT JOIN estado _est ON _est.id = _end.estado
        WHERE _end.logradouro ILIKE '%' || lower(p_logradouro) || '%'
    );
END;
$$ LANGUAGE plpgsql;


select search_address_by_param('Rua')