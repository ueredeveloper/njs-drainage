--drop FUNCTION search_interferences_by_param (param TEXT)

CREATE OR REPLACE FUNCTION search_interferences_by_param (param TEXT)
RETURNS JSONB AS $$

DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
                'id', i.id,
                'latitude', i.latitude,
                'longitude', i.longitude,
                'vazaoOutorgavel', COALESCE(s.vazao_outorgavel, 0),
                'vazaoTeste', COALESCE(s.vazao_teste, 0),
                'vazaoSistema', COALESCE(s.vazao_sistema, 0),
                'profundidade', COALESCE(NULLIF(s.profundidade, ''), '0'),
                'nivelEstatico', COALESCE(NULLIF(s.nivel_estatico, ''), '0'),
                'nivelDinamico', COALESCE(NULLIF(s.nivel_dinamico, ''), '0'),
                'caesb', COALESCE(s.caesb, FALSE),
                'tipoPoco', CASE WHEN s.tipo_poco IS NOT NULL 
                                 THEN jsonb_build_object('id', s.tipo_poco)
                                 ELSE NULL END,
                'unidadeHidrografica', CASE WHEN i.unidade_hidrografica IS NOT NULL 
                                 THEN jsonb_build_object(
                                     'objectid', uh.objectid,
                                     'uhNome', uh.uh_nome)
                                 ELSE NULL END,
                'baciaHidrografica', CASE WHEN i.bacia_hidrografica IS NOT NULL 
                                 THEN jsonb_build_object(
                                     'objectid', bh.objectid,
                                     'baciaNome', bh.bacia_nome)
                                 ELSE NULL END,
                'endereco', CASE WHEN e.id IS NOT NULL
                                 THEN jsonb_build_object(
                                     'id', e.id,
                                     'logradouro', e.logradouro,
                                     'bairro', e.bairro
                                     )
                                 ELSE NULL END,
                'tipoInterferencia', CASE WHEN ti.id IS NOT NULL
                                 THEN jsonb_build_object('id', ti.id, 'descricao', ti.descricao)
                                 ELSE NULL END,
                'tipoOutorga', CASE WHEN to2.id IS NOT NULL
                                 THEN jsonb_build_object('id', to2.id, 'descricao', to2.descricao)
                                 ELSE NULL END,
                'subtipoOutorga', CASE WHEN so.id IS NOT NULL
                                 THEN jsonb_build_object('id', so.id, 'descricao', so.descricao)
                                 ELSE NULL END,
                'situacaoProcesso', CASE WHEN sp.id IS NOT NULL
                                 THEN jsonb_build_object('id', sp.id, 'descricao', sp.descricao)
                                 ELSE NULL END,
                'tipoAto', CASE WHEN ta.id IS NOT NULL
                                 THEN jsonb_build_object('id', ta.id, 'descricao', ta.descricao)
                                 ELSE NULL END,
                'finalidades', COALESCE((
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', f.id,
                            'finalidade', f.finalidade,
                            'subfinalidade', f.subfinalidade,
                            'quantidade', COALESCE(f.quantidade, 0),
                            'consumo', COALESCE(f.consumo, 0),
                            'tipoFinalidade', jsonb_build_object('id', f.tipo_finalidade),
                            'total', COALESCE(f.total, 0)
                        )
                    ) FROM finalidade f WHERE f.interferencia = i.id
                ), '[]'::jsonb),
                'demandas', COALESCE((
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', d.id,
                            'tipoFinalidade', jsonb_build_object('id', d.tipo_finalidade),
                            'mes', d.mes,
                            'periodo', COALESCE(d.periodo, 0),
                            'tempo', COALESCE(d.tempo, 0),
                            'vazao', COALESCE(d.vazao, 0)
                        )
                    ) FROM demanda d WHERE d.interferencia = i.id
                ), '[]'::jsonb)
            ) 
    )
    INTO v_result
    FROM interferencia i
    LEFT JOIN subterranea s ON i.id = s.id
    LEFT JOIN tipo_interferencia ti ON ti.id = i.tipo_interferencia
    LEFT JOIN tipo_outorga to2 ON to2.id = i.tipo_outorga
    LEFT JOIN subtipo_outorga so ON so.id = i.subtipo_outorga
    LEFT JOIN situacao_processo sp ON sp.id = i.situacao_processo
    LEFT JOIN tipo_ato ta ON ta.id = i.tipo_ato
    LEFT JOIN unidades_hidrograficas uh ON uh.objectid = i.unidade_hidrografica
    LEFT JOIN bacias_hidrograficas bh ON bh.objectid = i.bacia_hidrografica
    LEFT JOIN endereco e ON e.id = i.endereco
    WHERE (param IS NULL OR param = '' OR LOWER(e.logradouro) LIKE LOWER('%' || param || '%'));

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

--select search_interferences_by_param ('casa')