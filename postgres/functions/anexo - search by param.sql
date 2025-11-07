--drop function search_attachment_by_param (param TEXT)

CREATE OR REPLACE FUNCTION search_attachment_by_param(param TEXT)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT COALESCE(
        json_agg(
            json_build_object(
                'id', a.id,
                'numero', a.numero,
                'processos', (
                    SELECT COALESCE(
                        json_agg(
                            json_build_object(
                                'id', p.id,
                                'numero', p.numero,
                                'usuario', json_build_object(
                                    'id', u.id,
                                    'nome', u.nome,
                                    'cpfCnpj', u.cpf_cnpj
                                )
                            )
                        ),
                        '[]'::json
                    )
                    FROM processo p
                    LEFT JOIN usuario u ON u.id = p.usuario
                    WHERE p.anexo = a.id
                )
            )
        ),
        '[]'::json
    )
    INTO v_result
    FROM anexo a
    WHERE a.numero ILIKE '%' || param || '%';
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;