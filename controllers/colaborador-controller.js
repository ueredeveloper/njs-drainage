const { upsertColaborador, loginColaborador } = require('../services/colaborador-service');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_REGEX = /^.{3,5}$/;

exports.upsertColaborador = async (req, res) => {
    try {
        const { id, email, password } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email é obrigatório' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ error: 'Email inválido' });
        }

        if (!id && !password) {
            return res.status(400).json({ error: 'Senha é obrigatória para novo colaborador' });
        }

        if (password && !SENHA_REGEX.test(password)) {
            return res.status(400).json({ error: 'A senha deve ter entre 3 e 5 caracteres' });
        }

        const result = await upsertColaborador({ id, email, password });
        res.status(200).json(result);
    } catch (err) {
        console.error('Error in upsertColaborador controller:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ error: 'Email inválido' });
        }

        const result = await loginColaborador({ email, password });
        res.status(200).json(result);
    } catch (err) {
        console.error('Error in login controller:', err);
        const status = err.message === 'Credenciais inválidas' ? 401
            : err.message === 'Acesso não autorizado' ? 403
            : 500;
        res.status(status).json({ error: err.message });
    }
};
