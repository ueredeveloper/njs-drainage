const express = require('express');
const { searchInterferenceByParam, upsertInterference, deleteInterference, searchInterferencesByAddressId } = require('../controllers/interferencia-controller');


const router = express.Router();

router.get('/search-interferences-by-param', searchInterferenceByParam);
router.get('/search-interferences-by-address-id', searchInterferencesByAddressId);
router.post('/upsert-interference', upsertInterference);
router.delete('/delete-interference', deleteInterference);

module.exports = router;