const express = require('express');
const { fetchAllStates } = require('../controllers/estado-controller');

const router = express.Router();

router.get('/fetch-all-states', fetchAllStates);

module.exports = router;