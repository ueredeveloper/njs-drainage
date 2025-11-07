CREATE OR REPLACE FUNCTION list_all_hidrogeo_poroso()
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'objectid', hp.objectid,
            'codPlan', hp.cod_plan,
            'sistema', hp.sistema,
            'qMedia', hp.q_media,
            'objectId', hp.objectid
        )
    )
    INTO v_result
    FROM hidrogeo_poroso hp;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

select  list_all_hidrogeo_poroso()