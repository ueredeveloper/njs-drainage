const express = require('express');
const { upsertColaborador, login, fetchAllColaboradores, updateAutorizacao } = require('../controllers/colaborador-controller');
const authMiddleware = require('../middlewares/auth-middleware');

const router = express.Router();

router.post('/login', login);
router.post('/upsert-colaborador', authMiddleware, upsertColaborador);
router.get('/fetch-all-colaboradores', authMiddleware, fetchAllColaboradores);
router.post('/update-autorizacao', authMiddleware, updateAutorizacao);

module.exports = router;
