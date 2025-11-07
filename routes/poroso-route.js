const express = require('express');

const { findPorosoSystemByPoint, listAllHydrogeoPoroso } = require('../controllers/poroso-controller');

const router = express.Router();

router.get('/find-by-point', findPorosoSystemByPoint);
router.get('/list-all', listAllHydrogeoPoroso);

module.exports = router;