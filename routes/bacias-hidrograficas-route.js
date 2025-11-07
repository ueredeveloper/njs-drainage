const express = require('express');
const { listAllHydrograficBasins, findHydrographicBasinByPoint } = require('../controllers/bacias-hidrograficas-controller');

const router = express.Router();

router.get('/list-all', listAllHydrograficBasins);
router.get('/find-by-point', findHydrographicBasinByPoint);

module.exports = router;