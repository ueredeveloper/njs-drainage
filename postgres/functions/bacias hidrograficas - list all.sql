CREATE OR REPLACE FUNCTION list_all_hydrographic_basins()
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', bh.objectid,
            'nome', bh.bacia_nome,
            'codigo', bh.bacia_cod,
            -- se depois for colocar os polígonos, é preciso prever isto no java, no model das bacias hidrograficas (regg+)
            --'shape', ST_AsGeoJSON(bh.shape)::jsonb
        )
    )
    INTO v_result
    FROM bacias_hidrograficas bh;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

select * from list_all_hydrographic_basins()