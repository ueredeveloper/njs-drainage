const express = require('express');
const { searchDocumentsByParam, searchDocumentsByUserId, upsertDocument, deleteDocument, deleteDocUserRelation } = require('../controllers/documento-controller');

const router = express.Router();

router.get('/search-documents-by-param', searchDocumentsByParam);
router.get('/search-documents-by-user-id', searchDocumentsByUserId);
router.post('/upsert-document', upsertDocument);
router.delete('/delete-document', deleteDocument);
router.delete('/delete-doc-user-relation', deleteDocUserRelation);

module.exports = router;