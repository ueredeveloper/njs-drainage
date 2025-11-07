CREATE OR REPLACE FUNCTION search_documents_by_user_id(p_user_id BIGINT)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_agg(
            json_build_object(
                'id', _doc.id,
                'numero', _doc.numero,
                'numeroSei', _doc.numero_sei,
                'tipoDocumento', json_build_object(
                    'id', _td.id,
                    'descricao', _td.descricao
                )
            )
        )
        FROM documento _doc
        LEFT JOIN usuario_documento _ud ON _ud.documento_id = _doc.id
        LEFT JOIN usuario _us ON _us.id = _ud.usuario_id
        LEFT JOIN documento_tipo _td ON _td.id = _doc.tipo_documento
        WHERE _us.id = p_user_id
    );
END;
$$ LANGUAGE plpgsql;


select * from search_documents_by_user_id (64)