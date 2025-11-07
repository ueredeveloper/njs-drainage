CREATE OR REPLACE FUNCTION find_poroso_system_by_point(
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'objectid', hp.objectid,
            'codPlan', hp.cod_plan,
            'sistema', hp.sistema,
			'qMedia', hp.q_media
        )
    )
    INTO v_result
    FROM hidrogeo_poroso hp
    WHERE ST_Contains(
        hp.shape,
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4674)
    );

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

select find_poroso_system_by_point(-47.9164122,-15.8722731)