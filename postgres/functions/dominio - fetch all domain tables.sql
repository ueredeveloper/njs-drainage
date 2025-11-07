

CREATE OR REPLACE FUNCTION fetch_all_domain_tables()
RETURNS JSONB AS
$$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'tipoInterferencia', (
            SELECT jsonb_object_agg(t.id::TEXT, jsonb_build_object('id', t.id, 'descricao', t.descricao))
            FROM tipo_interferencia t
        ),
        'tipoAto', (
            SELECT jsonb_object_agg(t.id::TEXT, jsonb_build_object('id', t.id, 'descricao', t.descricao))
            FROM tipo_ato t
        ),
        'tipoOutorga', (
            SELECT jsonb_object_agg(t.id::TEXT, jsonb_build_object('id', t.id, 'descricao', t.descricao))
            FROM tipo_outorga t
        ),
        'subtipoOutorga', (
            SELECT jsonb_object_agg(t.id::TEXT, jsonb_build_object('id', t.id, 'descricao', t.descricao))
            FROM subtipo_outorga t
        ),
        'estado', (
            SELECT jsonb_object_agg(t.id::TEXT, jsonb_build_object('id', t.id, 'descricao', t.descricao, 'enderecos', '[]'::jsonb))
            FROM estado t
        ),
        'situacaoProcesso', (
            SELECT jsonb_object_agg(t.id::TEXT, jsonb_build_object('id', t.id, 'descricao', t.descricao))
            FROM situacao_processo t
        ),
        'subsistema', '{}'::jsonb,
        'tipoPoco', (
            SELECT jsonb_object_agg(t.id::TEXT, jsonb_build_object('id', t.id, 'descricao', t.descricao, 'documentos', '[]'::jsonb))
            FROM tipo_poco t
        ),
        'localCaptacao', (
            SELECT jsonb_object_agg(t.id::TEXT, jsonb_build_object('id', t.id, 'descricao', t.descricao))
            FROM local_captacao t
        )
    )
    INTO v_result;

    RETURN v_result;
END;
$$
LANGUAGE plpgsql;



select fetch_all_domain_tables()

