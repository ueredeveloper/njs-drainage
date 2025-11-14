CREATE OR REPLACE FUNCTION search_interferences_by_address_id (add_id BIGINT)
RETURNS JSON AS
$$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'int_id', i.id,
        'end_id', e.id,
        'end_logradouro', e.logradouro,
        'int_latitude', i.latitude,
        'int_longitude', i.longitude,
        'dt_demanda', (
          SELECT json_agg(
            json_build_object(
              'id_interferencia', d.interferencia,
              'vazao_lh', d.vazao,
              'vazao_ld', d.vazao * d.tempo,
              'mes', d.mes,
              'vazao_mh', d.vazao / 1000.0,
              'tempo_h', d.tempo,
              'vol_max_md', (d.vazao / 1000.0) * d.tempo,
              'periodo_d', d.periodo,
              'vol_mensal_mm', (d.vazao / 1000.0) * d.periodo * d.tempo
            )
          )
          FROM demanda d
          WHERE d.interferencia = i.id AND d.tipo_finalidade = 2
        ),
        'sub_tp_id', s.tipo_poco,
        'vol_anual_ma', (
          SELECT COALESCE(SUM((dd.vazao / 1000.0) * dd.periodo * dd.tempo), 0)
          FROM demanda dd
          WHERE dd.interferencia = i.id AND dd.tipo_finalidade = 2
        )
      )
    )
    FROM interferencia i
	LEFT JOIN subterranea s ON s.id = i.id
    LEFT JOIN endereco e ON e.id = i.endereco
    WHERE e.id = add_id
  );
END;
$$
LANGUAGE plpgsql;