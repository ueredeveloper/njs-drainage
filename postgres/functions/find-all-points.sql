CREATE OR REPLACE FUNCTION find_all_points(searchQuery TEXT)
RETURNS TABLE (
  subterranea JSONB,
  superficial JSONB,
  barragem JSONB,
  lancamento_efluentes JSONB,
  lancamento_pluviais JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH subterranea_data AS (
    SELECT *
    FROM subterranea_sync
    WHERE
      us_nome ILIKE '%' || searchQuery || '%' OR
      us_cpf_cnpj ILIKE '%' || searchQuery || '%' OR
      emp_endereco ILIKE '%' || searchQuery || '%' OR
      int_processo ILIKE '%' || searchQuery || '%' OR
      int_num_ato ILIKE '%' || searchQuery || '%'
  ),
  superficial_data AS (
    SELECT *
    FROM superficial_sync
    WHERE
      us_nome ILIKE '%' || searchQuery || '%' OR
      us_cpf_cnpj ILIKE '%' || searchQuery || '%' OR
      emp_endereco ILIKE '%' || searchQuery || '%' OR
      int_processo ILIKE '%' || searchQuery || '%' OR
      int_num_ato ILIKE '%' || searchQuery || '%'
  ),
  barragem_data AS (
    SELECT *
    FROM barragem_sync
    WHERE
      us_nome ILIKE '%' || searchQuery || '%' OR
      us_cpf_cnpj ILIKE '%' || searchQuery || '%' OR
      emp_endereco ILIKE '%' || searchQuery || '%' OR
      int_processo ILIKE '%' || searchQuery || '%' OR
      int_num_ato ILIKE '%' || searchQuery || '%'
  ),
  lancamento_efluentes_data AS (
    SELECT *
    FROM lancamento_efluentes_sync
    WHERE
      us_nome ILIKE '%' || searchQuery || '%' OR
      us_cpf_cnpj ILIKE '%' || searchQuery || '%' OR
      emp_endereco ILIKE '%' || searchQuery || '%' OR
      int_processo ILIKE '%' || searchQuery || '%' OR
      int_num_ato ILIKE '%' || searchQuery || '%'
  ),
  lancamento_pluviais_data AS (
    SELECT *
    FROM lancamento_pluviais_sync
    WHERE
      us_nome ILIKE '%' || searchQuery || '%' OR
      us_cpf_cnpj ILIKE '%' || searchQuery || '%' OR
      emp_endereco ILIKE '%' || searchQuery || '%' OR
      int_processo ILIKE '%' || searchQuery || '%' OR
      int_num_ato ILIKE '%' || searchQuery || '%'
  )
  SELECT
    (SELECT jsonb_agg(_sub) FROM subterranea_data _sub) AS subterranea,
    (SELECT jsonb_agg(_sup) FROM superficial_data _sup) AS superficial,
    (SELECT jsonb_agg(_bar) FROM barragem_data _bar) AS barragem,
    (SELECT jsonb_agg(_lan_eflu) FROM lancamento_efluentes_data _lan_eflu) AS lancamento_efluentes,
    (SELECT jsonb_agg(_lan_plu) FROM lancamento_pluviais_data _lan_plu) AS lancamento_pluviais;
END;
$$ LANGUAGE plpgsql;
