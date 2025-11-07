CREATE OR REPLACE FUNCTION upsert_subterranea(sub_json JSONB)
RETURNS JSONB AS $$
DECLARE
    v_int_id BIGINT;
    v_tipo_poco_id BIGINT;
    v_tipo_interferencia_id BIGINT;
    v_tipo_outorga_id BIGINT;
    v_subtipo_outorga_id BIGINT;
    v_situacao_processo_id BIGINT;
    v_tipo_ato_id BIGINT;
    v_bacia_id BIGINT;
    v_uh_id BIGINT;
    v_endereco_id BIGINT;
    v_finalidade JSONB;
    v_demanda JSONB;
    v_result JSONB;
BEGIN
    -- 1️⃣ Extração dos campos principais
    v_tipo_poco_id := (sub_json->'tipoPoco'->>'id')::BIGINT;
    v_tipo_interferencia_id := (sub_json->'tipoInterferencia'->>'id')::BIGINT;
    v_tipo_outorga_id := (sub_json->'tipoOutorga'->>'id')::BIGINT;
    v_subtipo_outorga_id := (sub_json->'subtipoOutorga'->>'id')::BIGINT;
    v_situacao_processo_id := (sub_json->'situacaoProcesso'->>'id')::BIGINT;
    v_tipo_ato_id := (sub_json->'tipoAto'->>'id')::BIGINT;
    v_bacia_id := (sub_json->'baciaHidrografica'->>'objectid')::BIGINT;
    v_uh_id := (sub_json->'unidadeHidrografica'->>'objectid')::BIGINT;
    v_endereco_id := (sub_json->'endereco'->>'id')::BIGINT;

    -- 2️⃣ Validação obrigatória
    IF v_tipo_interferencia_id IS NULL THEN
        RETURN jsonb_build_object(
            'status', 'error',
            'mensagem', 'Campo obrigatório "tipoInterferencia" não informado.',
            'object', NULL
        );
    END IF;

    BEGIN
        -- 3️⃣ Atualiza se já existir id
        IF sub_json ? 'id' AND (sub_json->>'id')::BIGINT IS NOT NULL THEN
            v_int_id := (sub_json->>'id')::BIGINT;

            UPDATE interferencia
            SET latitude = (sub_json->>'latitude')::DOUBLE PRECISION,
                longitude = (sub_json->>'longitude')::DOUBLE PRECISION,
                tipo_interferencia = v_tipo_interferencia_id,
                tipo_outorga = v_tipo_outorga_id,
                subtipo_outorga = v_subtipo_outorga_id,
                situacao_processo = v_situacao_processo_id,
                tipo_ato = v_tipo_ato_id,
                unidade_hidrografica = v_uh_id,
                bacia_hidrografica = v_bacia_id,
                endereco = v_endereco_id
            WHERE id = v_int_id;

            IF NOT FOUND THEN
                RETURN jsonb_build_object(
                    'status', 'error',
                    'mensagem', format('Interferência com id=%s não encontrada.', v_int_id),
                    'object', NULL
                );
            END IF;

            UPDATE subterranea
            SET caesb = (sub_json->>'caesb')::BOOLEAN,
                nivel_estatico = sub_json->>'nivelEstatico',
                nivel_dinamico = sub_json->>'nivelDinamico',
                profundidade = sub_json->>'profundidade',
                vazao_outorgavel = (sub_json->>'vazaoOutorgavel')::DOUBLE PRECISION,
                vazao_sistema = (sub_json->>'vazaoSistema')::DOUBLE PRECISION,
                vazao_teste = (sub_json->>'vazaoTeste')::DOUBLE PRECISION,
                tipo_poco = v_tipo_poco_id,
                sistema = sub_json->>'sistema',
                subsistema = sub_json->>'subsistema',
                cod_plan = sub_json->>'codPlan'
            WHERE id = v_int_id;

        ELSE
            -- 4️⃣ Inserção nova
            INSERT INTO interferencia (
                latitude, longitude, tipo_interferencia, tipo_outorga,
                subtipo_outorga, situacao_processo, tipo_ato,
                unidade_hidrografica, bacia_hidrografica, endereco
            )
            VALUES (
                (sub_json->>'latitude')::DOUBLE PRECISION,
                (sub_json->>'longitude')::DOUBLE PRECISION,
                v_tipo_interferencia_id,
                v_tipo_outorga_id,
                v_subtipo_outorga_id,
                v_situacao_processo_id,
                v_tipo_ato_id,
                v_uh_id,
                v_bacia_id,
                v_endereco_id
            )
            RETURNING id INTO v_int_id;

            INSERT INTO subterranea (
                id, caesb, nivel_estatico, nivel_dinamico, profundidade,
                vazao_outorgavel, vazao_sistema, vazao_teste, tipo_poco, 
                sistema, subsistema, cod_plan
            )
            VALUES (
                v_int_id,
                (sub_json->>'caesb')::BOOLEAN,
                sub_json->>'nivelEstatico',
                sub_json->>'nivelDinamico',
                sub_json->>'profundidade',
                (sub_json->>'vazaoOutorgavel')::DOUBLE PRECISION,
                (sub_json->>'vazaoSistema')::DOUBLE PRECISION,
                (sub_json->>'vazaoTeste')::DOUBLE PRECISION,
                v_tipo_poco_id,
                sub_json->>'sistema',
                sub_json->>'subsistema',
                sub_json->>'codPlan'
            );
        END IF;

        -- 5️⃣ Finalidades
        FOR v_finalidade IN SELECT jsonb_array_elements(sub_json->'finalidades')
        LOOP
            IF (v_finalidade->>'id') IS NOT NULL THEN
                UPDATE finalidade
                SET finalidade = v_finalidade->>'finalidade',
                    subfinalidade = v_finalidade->>'subfinalidade',
                    quantidade = (v_finalidade->>'quantidade')::DOUBLE PRECISION,
                    consumo = (v_finalidade->>'consumo')::DOUBLE PRECISION,
                    total = (v_finalidade->>'total')::DOUBLE PRECISION,
                    tipo_finalidade = (v_finalidade->'tipoFinalidade'->>'id')::BIGINT
                WHERE id = (v_finalidade->>'id')::BIGINT
                  AND interferencia = v_int_id;
            ELSE
                INSERT INTO finalidade (
                    interferencia, finalidade, subfinalidade, quantidade, consumo, total, tipo_finalidade
                )
                VALUES (
                    v_int_id,
                    v_finalidade->>'finalidade',
                    v_finalidade->>'subfinalidade',
                    (v_finalidade->>'quantidade')::DOUBLE PRECISION,
                    (v_finalidade->>'consumo')::DOUBLE PRECISION,
                    (v_finalidade->>'total')::DOUBLE PRECISION,
                    (v_finalidade->'tipoFinalidade'->>'id')::BIGINT
                );
            END IF;
        END LOOP;

        -- 6️⃣ Demandas
        FOR v_demanda IN SELECT jsonb_array_elements(sub_json->'demandas')
        LOOP
            IF (v_demanda->>'id') IS NOT NULL THEN
                UPDATE demanda
                SET vazao = (v_demanda->>'vazao')::DOUBLE PRECISION,
                    tempo = (v_demanda->>'tempo')::DOUBLE PRECISION,
                    periodo = (v_demanda->>'periodo')::DOUBLE PRECISION,
                    mes = (v_demanda->>'mes')::INTEGER,
                    tipo_finalidade = (v_demanda->'tipoFinalidade'->>'id')::BIGINT
                WHERE id = (v_demanda->>'id')::BIGINT
                  AND interferencia = v_int_id;
            ELSE
                INSERT INTO demanda (
                    interferencia, vazao, tempo, periodo, mes, tipo_finalidade
                )
                VALUES (
                    v_int_id,
                    (v_demanda->>'vazao')::DOUBLE PRECISION,
                    (v_demanda->>'tempo')::DOUBLE PRECISION,
                    (v_demanda->>'periodo')::DOUBLE PRECISION,
                    (v_demanda->>'mes')::INTEGER,
                    (v_demanda->'tipoFinalidade'->>'id')::BIGINT
                );
            END IF;
        END LOOP;

        -- 7️⃣ Retorno completo
        SELECT jsonb_build_object(
            'status', 'success',
            'mensagem', CASE WHEN sub_json ? 'id' THEN 'Subterrânea atualizada com sucesso.' ELSE 'Subterrânea criada com sucesso.' END,
            'object', jsonb_build_object(
                'id', _int.id,
                'latitude', _int.latitude,
                'longitude', _int.longitude,
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
                'unidadeHidrografica', CASE WHEN _int.unidade_hidrografica IS NOT NULL 
                                 THEN jsonb_build_object(
                                     'objectid', uh.objectid,
                                     'uhNome', uh.uh_nome)
                                 ELSE NULL END,
                'baciaHidrografica', CASE WHEN _int.bacia_hidrografica IS NOT NULL 
                                 THEN jsonb_build_object(
                                     'objectid', bh.objectid,
                                     'baciaNome', bh.bacia_nome)
                                 ELSE NULL END,
                'endereco', CASE WHEN e.id IS NOT NULL
                                 THEN jsonb_build_object(
                                     'id', e.id,
                                     'logradouro', e.logradouro)
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
                    ) FROM finalidade f WHERE f.interferencia = _int.id
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
                    ) FROM demanda d WHERE d.interferencia = _int.id
                ), '[]'::jsonb)
            )
        )
        INTO v_result
        FROM interferencia _int
        LEFT JOIN subterranea s ON _int.id = s.id
        LEFT JOIN tipo_interferencia ti ON ti.id = _int.tipo_interferencia
        LEFT JOIN tipo_outorga to2 ON to2.id = _int.tipo_outorga
        LEFT JOIN subtipo_outorga so ON so.id = _int.subtipo_outorga
        LEFT JOIN situacao_processo sp ON sp.id = _int.situacao_processo
        LEFT JOIN tipo_ato ta ON ta.id = _int.tipo_ato
        LEFT JOIN unidades_hidrograficas uh ON uh.objectid = _int.unidade_hidrografica
        LEFT JOIN bacias_hidrograficas bh ON bh.objectid = _int.bacia_hidrografica
        LEFT JOIN endereco e ON e.id = _int.endereco
        WHERE _int.id = v_int_id;

        RETURN v_result;

    EXCEPTION
        WHEN OTHERS THEN
            RETURN jsonb_build_object(
                'status', 'error',
                'mensagem', 'Erro ao salvar subterrânea: ' || SQLERRM,
                'object', NULL
            );
    END;
END;
$$ LANGUAGE plpgsql;