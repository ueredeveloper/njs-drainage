/** Busca pontos superficiais em um unidade hidrográfica através do código desta UH. Esta função é para a união de todos
os projetos em um só. O projeto anterior, njs-js-drainage, no replit utiliza a função find_superficial_points-by-uh.
*/

CREATE OR REPLACE FUNCTION find_surface_points_inside_uh(uh_codigo INT)
RETURNS TABLE (
  subterranea JSONB,
  superficial JSONB,
  barragem JSONB,
  lancamento_efluentes JSONB,
  lancamento_pluviais JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    NULL::jsonb,
    (
      SELECT jsonb_agg(row_to_json(s))
      FROM superficial_sync s
      WHERE s.uh_codigo = find_surface_points_inside_uh.uh_codigo
    ),
    NULL::jsonb,
    NULL::jsonb,
    NULL::jsonb;
END;
$$ LANGUAGE plpgsql;
