const express = require('express');
const { findFraturadoSystemByPoint, listAllHydrogeoFraturado } = require('../controllers/fraturado-controller');

const router = express.Router();

router.get('/find-by-point', findFraturadoSystemByPoint);
router.get('/list-all', listAllHydrogeoFraturado);

module.exports = router;