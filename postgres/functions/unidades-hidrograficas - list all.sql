CREATE OR REPLACE FUNCTION list_all_hydrographic_units()
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', uh.objectid,
            'codigo', uh.uh_codigo,
            'label', uh.uh_label,
            'baciaCodigo', uh.bacia_codi,
            'nome', uh.uh_nome
        )
    )
    INTO v_result
    FROM unidades_hidrograficas uh;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

select list_all_hydrographic_units()