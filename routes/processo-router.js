const express = require('express');
const { searchProcessByParam, upsertProcess, deleteProcess } = require('../controllers/processo-controller');

const router = express.Router();

router.get('/search-processes-by-param', searchProcessByParam);
router.post('/upsert-process', upsertProcess);
router.delete('/delete-process', deleteProcess);

module.exports = router;