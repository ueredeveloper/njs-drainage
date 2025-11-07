const express = require('express');
const { searchAttachmentByParam, upsertAttachment, deleteAttachment } = require('../controllers/anexo-controller');

const router = express.Router();

router.get('/search-attachments-by-param', searchAttachmentByParam);
router.post('/upsert-attachment', upsertAttachment);
router.delete('/delete-attachment', deleteAttachment);

module.exports = router;