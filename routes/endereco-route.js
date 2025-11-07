const express = require('express');
const { searchAddressByParam, upsertAddress, deleteAddress } = require('../controllers/endereco-controller');


const router = express.Router();

router.get('/search-address-by-param', searchAddressByParam);
router.post('/upsert-address', upsertAddress);
router.delete('/delete-address', deleteAddress);

module.exports = router;