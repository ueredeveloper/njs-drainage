const express = require('express');
const { getDocumentTypesController } = require('../controllers/tipo-documento-controller');


const router = express.Router();
/**
 * busca todos os tipos de documentos
 * Retorno: [{"id": 1, descricão: "Parecer"}, ...]
 */
router.get('/', getDocumentTypesController);

module.exports = router;