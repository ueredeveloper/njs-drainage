/**
 Seleciona os tipos de documentos
 retorno: 

    "[
        {"id" : 1, "descricao" : "Parecer"}, 
        {"id" : 2, "descricao" : "Despacho"}, ...
    ]"
*/

CREATE OR REPLACE FUNCTION get_document_types ()
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(json_build_object('id', _td.id, 'descricao', _td.descricao))
    INTO result
    FROM documento_tipo _td;

    RETURN result;
END;
$$ LANGUAGE plpgsql;


--select get_document_types()