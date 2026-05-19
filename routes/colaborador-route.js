const express = require('express');
const { upsertColaborador, login } = require('../controllers/colaborador-controller');

const router = express.Router();

router.post('/upsert-colaborador', upsertColaborador);
router.post('/login', login);

module.exports = router;
