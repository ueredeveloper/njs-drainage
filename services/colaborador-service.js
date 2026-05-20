const { getClient } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '4h';

exports.upsertColaborador = async ({ id, email, password }) => {
    let client;
    try {
        client = await getClient();

        const passwordHash = password ? await bcrypt.hash(password, 10) : null;

        const query = `SELECT * FROM upsert_colaborador($1, $2, $3)`;
        const { rows } = await client.query(query, [id || null, email, passwordHash]);

        return rows[0] || null;
    } catch (err) {
        console.error('Error in upsertColaborador:', err.stack);
        throw err;
    } finally {
        await client.end();
    }
};

exports.loginColaborador = async ({ email, password }) => {
    let client;
    try {
        client = await getClient();

        const query = `SELECT id, email, password_hash, autorizacao, admin FROM colaborador WHERE email = lower(trim($1))`;
        const { rows } = await client.query(query, [email]);

        const colaborador = rows[0];

        if (!colaborador) {
            throw new Error('Credenciais inválidas');
        }

        const senhaValida = await bcrypt.compare(password, colaborador.password_hash);

        if (!senhaValida) {
            throw new Error('Credenciais inválidas');
        }

        if (!colaborador.autorizacao) {
            throw new Error('Acesso não autorizado');
        }

        const token = jwt.sign(
            { id: colaborador.id, email: colaborador.email, admin: colaborador.admin },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return {
            token,
            colaborador: { id: colaborador.id, email: colaborador.email, admin: colaborador.admin }
        };
    } catch (err) {
        console.error('Error in loginColaborador:', err.stack);
        throw err;
    } finally {
        await client.end();
    }
};

exports.fetchAllColaboradores = async () => {
    let client;
    try {
        client = await getClient();
        const { rows } = await client.query(
            `SELECT id, email, autorizacao FROM colaborador ORDER BY email`
        );
        return rows;
    } catch (err) {
        console.error('Error in fetchAllColaboradores:', err.stack);
        throw err;
    } finally {
        await client.end();
    }
};

exports.updateAutorizacao = async ({ id, autorizacao }) => {
    let client;
    try {
        client = await getClient();
        const { rows } = await client.query(
            `UPDATE colaborador SET autorizacao = $2 WHERE id = $1 RETURNING id, email, autorizacao`,
            [id, autorizacao]
        );
        if (rows.length === 0) throw new Error('Colaborador não encontrado');
        return rows[0];
    } catch (err) {
        console.error('Error in updateAutorizacao:', err.stack);
        throw err;
    } finally {
        await client.end();
    }
};
