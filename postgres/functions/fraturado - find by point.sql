CREATE OR REPLACE FUNCTION find_fraturado_system_by_point(
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'objectid', hf.objectid,
            'codPlan', hf.cod_plan,
            'sistema', hf.sistema,
            'subsistema', hf.subsistema,
			'vazao', hf.vazao
        )
    )
    INTO v_result
    FROM hidrogeo_fraturado hf
    WHERE ST_Contains(
        hf.shape,
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4674)
    );

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

select find_fraturado_system_by_point(-47.9164122,-15.8722731)