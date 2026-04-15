CREATE OR REPLACE FUNCTION calculate_reservoir_water_balance(p_input jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    -- Parâmetros informados pelo usuário
    v_latitude          numeric;
    v_longitude         numeric;
    v_max_volume        numeric;
    v_min_volume        numeric;
    v_tot_area          numeric;
    v_m_infiltration    numeric;
    v_q_reg             numeric;
    v_min_vol_observed  numeric;
    v_q_cap             numeric[];
    
    v_anos              integer;
    v_meses             text[];
    v_dias              integer[];
    v_evaporacao        numeric[];
    v_temp_dia          integer[];

    -- Variáveis da localização e hierarquia
    v_point             geometry;
    v_cobacia           text;
    v_cocursodag        text;
    v_uh_rotulo         text;
	v_uh_nome           text;
    
    -- Dados da UH
    v_qmm               numeric[];
    v_uh_area_km2       numeric;
    
    -- Área de contribuição (somatório Otto)
    v_area_contribuicao numeric := 0;
    
    -- Resultados calculados
    v_qmm_regionalizada numeric[];
    v_q_defluente       numeric[];
    
    -- Barragens dentro das Otto bacias
    v_barragens         jsonb := '[]'::jsonb;

    v_json_result       jsonb;
BEGIN
    -- 1. Extração dos parâmetros
    v_latitude         := (p_input -> 'coordenadas' ->> 'latitude')::numeric;
    v_longitude        := (p_input -> 'coordenadas' ->> 'longitude')::numeric;
    
    v_max_volume       := (p_input -> 'dam_data' ->> 'Max_Volume')::numeric;
    v_min_volume       := (p_input -> 'dam_data' ->> 'Min_Volume')::numeric;
    v_tot_area         := (p_input -> 'dam_data' ->> 'Tot_Area')::numeric;
    v_m_infiltration   := (p_input -> 'dam_data' ->> 'M_Infiltration')::numeric;
    v_q_reg            := (p_input -> 'dam_data' ->> 'Q_Reg')::numeric;
    v_min_vol_observed := (p_input -> 'dam_data' ->> 'Min_Vol_Observed')::numeric;
    v_q_cap            := ARRAY(SELECT value::numeric FROM jsonb_array_elements_text(p_input -> 'dam_data' -> 'Q_Cap'));
						
    
    v_anos             := (p_input -> 'operacao' ->> 'anos')::integer;
    v_meses            := ARRAY(SELECT value::text FROM jsonb_array_elements_text(p_input -> 'operacao' -> 'Meses'));
    v_dias             := ARRAY(SELECT value::integer FROM jsonb_array_elements_text(p_input -> 'operacao' -> 'Dias'));
    v_evaporacao       := ARRAY(SELECT value::numeric FROM jsonb_array_elements_text(p_input -> 'operacao' -> 'Evaporacao'));
    v_temp_dia         := ARRAY(SELECT value::integer FROM jsonb_array_elements_text(p_input -> 'operacao' -> 'tempDia'));

    -- 2. Ponto geográfico
    v_point := ST_SetSRID(ST_MakePoint(v_longitude, v_latitude), 4674);

    -- 3. Encontra a Otto bacia "menor" para hierarquia
    SELECT cobacia, cocursodag, uh_rotulo, uh_nome
    INTO v_cobacia, v_cocursodag, v_uh_rotulo, v_uh_nome
    FROM otto_bacias
    WHERE ST_Contains(geometry, v_point)
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Nenhuma Otto bacia encontrada para esta coordenada');
    END IF;

    -- 4. Área de contribuição (somatório nuareacont da hierarquia)
    SELECT COALESCE(SUM(nuareacont), 0)
    INTO v_area_contribuicao
    FROM otto_bacias
    WHERE cobacia >= v_cobacia
      AND cocursodag LIKE v_cocursodag || '%'
      AND uh_rotulo = v_uh_rotulo;

    -- 5. Dados da UH (Qmm mensal + área)
    SELECT 
        ARRAY[
            COALESCE(qmm_jan, 0), COALESCE(qmm_fev, 0), COALESCE(qmm_mar, 0),
            COALESCE(qmm_abr, 0), COALESCE(qmm_mai, 0), COALESCE(qmm_jun, 0),
            COALESCE(qmm_jul, 0), COALESCE(qmm_ago, 0), COALESCE(qmm_set, 0),
            COALESCE(qmm_out, 0), COALESCE(qmm_nov, 0), COALESCE(qmm_dez, 0)
        ],
        COALESCE(area_km_sq, 0)  -- ajuste o nome da coluna se for diferente
    INTO v_qmm, v_uh_area_km2
    FROM unidades_hidrograficas
    WHERE ST_Contains(shape, v_point)
    LIMIT 1;

    IF v_qmm IS NULL THEN
        v_qmm := ARRAY_FILL(0::numeric, ARRAY[12]);
        v_uh_area_km2 := 0;
    END IF;

    -- 6. Cálculos derivados
    v_qmm_regionalizada := ARRAY(
        SELECT ROUND(((q_val / NULLIF(v_uh_area_km2, 0)) * v_area_contribuicao)/1000, 4)
        FROM unnest(v_qmm) AS q_val
    );

    v_q_defluente := ARRAY(
        SELECT ROUND((((q_val / NULLIF(v_uh_area_km2, 0)) * v_area_contribuicao)* 0.2)/1000, 4) 
        FROM unnest(v_qmm) AS q_val
    );

    -- 7. Lista de barragens dentro das Otto bacias da hierarquia
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', id, 
                'area_contribuicao', COALESCE(area_contribuicao, 0),
                'us_endereco', COALESCE(us_endereco, ''),
                'us_nome', COALESCE(us_nome, ''),
                'int_shape', ST_AsGeoJSON(int_shape)::jsonb,
				'int_processo', COALESCE(int_processo, '')
				
            )
        ),
        '[]'::jsonb
    )
    INTO v_barragens
    FROM barragem_sync b
    WHERE EXISTS (
        SELECT 1
        FROM otto_bacias o
        WHERE o.cobacia >= v_cobacia
          AND o.cocursodag LIKE v_cocursodag || '%'
          AND o.uh_rotulo = v_uh_rotulo
          AND ST_Contains(o.geometry, b.int_shape)
    );

    -- 8. Montagem do resultado final
    v_json_result := jsonb_build_object(
        'coordenadas', jsonb_build_object(
            'latitude',  v_latitude,
            'longitude', v_longitude
        ),
        'dam_data', jsonb_build_object(
            'Max_Volume',        v_max_volume,
            'Min_Volume',        v_min_volume,
            'Tot_Area',          v_tot_area,
            'M_Infiltration',    v_m_infiltration,
            'Q_Reg',             v_q_reg,
            'Min_Vol_Observed',  v_min_vol_observed,
            'Q_Cap',             v_q_cap
        ),
        'operacao', jsonb_build_object(
            'anos',               v_anos,
            'Meses',              v_meses,
            'Qmm',                v_qmm,
            'QmmRegionalizada',   v_qmm_regionalizada,
            'Dias',               v_dias,
            'Evaporacao',         v_evaporacao,
            'tempDia',            v_temp_dia,
            'areaDeContribuicao', v_area_contribuicao,
            'Q_defluente',        v_q_defluente
        ),
        'informacoes_adicionais', jsonb_build_object(
            'uh_area_km2_usada', v_uh_area_km2,
			'area_contribuicao', v_area_contribuicao,
			'uh_nome', 	v_uh_nome,
			'uh_rotulo', v_uh_rotulo,
            'data_calculo',        CURRENT_TIMESTAMP,
            'Qmm_fonte',           'tabela unidades_hidrograficas (colunas qmm_jan a qmm_dez)',
            'barragens_encontradas', v_barragens
        )
    );

    RETURN v_json_result;
END;

$$;



SELECT calculate_reservoir_water_balance('{
  "coordenadas": {
    "latitude": -15.775139,
    "longitude": -47.939599
  },
  "dam_data": {
    "Max_Volume": 173000,
    "Min_Volume": 0,
    "Tot_Area": 40520.46,
    "M_Infiltration": 0.1,
    "Q_Reg": 0.034,
    "Min_Vol_Observed": 0,
    "Q_Cap": 104
  },
  "operacao": {
    "anos": 1,
    "Meses": ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
    "Dias": [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    "Evaporacao": [130.06, 141.88, 130.65, 115.87, 104.00, 96.00, 116.02, 159.60, 169.76, 204.80, 110.62, 120.58],
    "tempDia": [24, 24, 24, 24, 24, 0, 0, 0, 0, 24, 24, 24]
  }
}'::jsonb);