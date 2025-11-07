const express = require('express');
const { listAllHydrograficUnits, findHydrographicUnitByPoint } = require('../controllers/unidades-hidrograficas-controller');

const router = express.Router();

router.get('/list-all', listAllHydrograficUnits);
router.get('/find-by-point', findHydrographicUnitByPoint);

module.exports = router;