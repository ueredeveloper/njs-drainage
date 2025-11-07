CREATE OR REPLACE FUNCTION find_hydrographic_basin_by_point(
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'baciaNome', bh.bacia_nome,
            'baciaCod', bh.bacia_cod,
            'objectid', bh.objectid
        )
    )
    INTO v_result
    FROM bacias_hidrograficas bh
    WHERE ST_Contains(
        bh.shape,
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4674)
    );

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION find_hydrographic_unit_by_point(
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'objectid', uh.objectid,
            'uhCodigo', uh.uh_codigo,
            'uhLabel', uh.uh_label,
            'baciaCodi', uh.bacia_codi,
            'uhNome', uh.uh_nome
        )
    )
    INTO v_result
    FROM unidades_hidrograficas uh
    WHERE ST_Contains(
        uh.shape,
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4674) -- SRID SIRGAS 2000
    );

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;