const express = require('express');
const { deletePurpose } = require('../controllers/finalidade-controller');

const router = express.Router();


router.delete('/delete-purpose', deletePurpose);

module.exports = router;