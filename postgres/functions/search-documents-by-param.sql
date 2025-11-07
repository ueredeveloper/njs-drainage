-- não posso usar unaccente, verificar outro modo CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION search_documents_by_param (param TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'id', _doc.id,
        'numero', _doc.numero,
        'numero_sei', _doc.numero_sei,
        'processo', json_build_object(
            'id', _proc.id,
            'numero', _proc.numero,
            'anexo', json_build_object(
                'id', _an.id,
                'numero', _an.numero
            )
        ),
        'endereco', json_build_object(
            'id', _end.id,
            'logradouro', _end.logradouro
        ),
        'tipo_documento', json_build_object(
            'id', dt.id,
            'descricao', dt.descricao
        )
      )
    )
    FROM documento _doc
    LEFT JOIN documento_tipo dt ON dt.id = _doc.tipo_documento
    LEFT JOIN endereco _end ON _end.id = _doc.endereco
    LEFT JOIN processo _proc ON _proc.id = _doc.processo
    LEFT JOIN anexo _an ON _an.id = _proc.anexo
    WHERE 
        _doc.numero ILIKE '%'|| param || '%' OR 
        _doc.numero_sei ILIKE '%'|| param || '%' OR  
        _proc.numero ILIKE '%'|| param || '%' OR
        LOWER(_end.logradouro) ILIKE '%' || LOWER(param) || '%'
  );
END;
$$ LANGUAGE plpgsql;

--teste de função
SELECT * FROM search_documents_by_param('Rua');