--drop function upsert_attachment(p_data JSONB)

CREATE OR REPLACE FUNCTION upsert_attachment(p_data JSONB)
RETURNS JSONB AS $$
DECLARE
    v_id INTEGER;
    v_numero TEXT;
    v_result JSONB;
BEGIN
    -- Extrai campos do JSON recebido
    v_id := (p_data ->> 'id')::INTEGER;
    v_numero := p_data ->> 'numero';

    -- 🔹 Inserção
    IF v_id IS NULL OR v_id = 0 THEN
        BEGIN
            INSERT INTO anexo (numero)
            VALUES (v_numero)
            RETURNING id INTO v_id;

        EXCEPTION
            WHEN unique_violation THEN
                RETURN jsonb_build_object(
                    'status', 'error',
                    'mensagem', format('Já existe um anexo com o número %s.', v_numero),
                    'objeto', NULL
                );
        END;

        -- Busca completa com processos e usuários
        SELECT jsonb_build_object(
            'id', a.id,
            'numero', a.numero,
            'processos', COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', p.id,
                            'numero', p.numero,
                            'usuario', json_build_object(
                                'id', u.id,
                                'nome', u.nome,
                                'cpfCnpj', u.cpf_cnpj
                            )
                        )
                    )
                    FROM processo p
                    JOIN usuario u ON u.id = p.usuario
                    WHERE p.anexo = a.id
                ),
                '[]'::json
            )
        )
        INTO v_result
        FROM anexo a
        WHERE a.id = v_id;

        RETURN jsonb_build_object(
            'status', 'success',
            'mensagem', 'Anexo salvo com sucesso.',
            'objeto', v_result
        );

    -- 🔹 Atualização
    ELSE
        IF EXISTS (SELECT 1 FROM anexo WHERE id = v_id) THEN
            BEGIN
                UPDATE anexo
                SET numero = v_numero
                WHERE id = v_id;

            EXCEPTION
                WHEN unique_violation THEN
                    RETURN jsonb_build_object(
                        'status', 'error',
                        'mensagem', format('Já existe outro anexo com o número %s.', v_numero),
                        'objeto', NULL
                    );
            END;

            -- Busca completa com processos e usuários
            SELECT jsonb_build_object(
                'id', a.id,
                'numero', a.numero,
                'processos', COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', p.id,
                                'numero', p.numero,
                                'usuario', json_build_object(
                                    'id', u.id,
                                    'nome', u.nome,
                                    'cpfCnpj', u.cpf_cnpj
                                )
                            )
                        )
                        FROM processo p
                        JOIN usuario u ON u.id = p.usuario
                        WHERE p.anexo = a.id
                    ),
                    '[]'::json
                )
            )
            INTO v_result
            FROM anexo a
            WHERE a.id = v_id;

            RETURN jsonb_build_object(
                'status', 'success',
                'mensagem', 'Anexo editado com sucesso.',
                'objeto', v_result
            );

        ELSE
            RETURN jsonb_build_object(
                'status', 'error',
                'mensagem', format('Anexo com id=%s não encontrado.', v_id),
                'objeto', NULL
            );
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;