const express = require('express');
const { fetchAllDomainTables } = require('../controllers/dominio-controller');

const router = express.Router();

router.get('/fetch-all-domain-tables', fetchAllDomainTables);

module.exports = router;