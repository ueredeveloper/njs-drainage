CREATE OR REPLACE FUNCTION list_all_hidrogeo_fraturado()
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'objectid', hf.objectid,
            'codPlan', hf.cod_plan,
            'sistema', hf.sistema,
            'subsistema', hf.subsistema,
            'vazao', hf.vazao,
            'objectId', hf.objectid
        )
    )
    INTO v_result
    FROM hidrogeo_fraturado hf;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

select list_all_hidrogeo_fraturado()
