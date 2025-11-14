CREATE OR REPLACE FUNCTION search_users_with_doc_by_param (param TEXT)
RETURNS JSON AS
$$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'us_id', _u.id,
        'us_nome', _u.nome,
        'us_cpf_cnpj', _u.cpf_cnpj,
        'us_doc_id', _d.id,
        'doc_end', _d.endereco,
        'doc_sei', _d.numero_sei,
        'proc_sei', _d.processo,
        'end_id', _e.id,
        'end_logradouro', _e.logradouro
      )
    )
    FROM usuario _u
    LEFT JOIN processo _p ON _p.usuario = _u.id
    LEFT JOIN documento _d ON _d.processo = _p.id
    LEFT JOIN endereco _e ON _d.endereco = _e.id
    WHERE 
      _u.nome ILIKE '%' || param || '%' 
      OR _u.cpf_cnpj ILIKE '%' || param || '%'
      OR _d.numero ILIKE '%' || param || '%'
      OR _p.numero ILIKE '%' || param || '%'
  );
END;
$$
LANGUAGE plpgsql;
