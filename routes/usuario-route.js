const express = require('express');
const { searchUserByParam, upsertUser, deleteUserById, searchUsersByDocumentId, searchUsersByCpfCnpj, searchUsersWithDocByParam } = require('../controllers/usuario-controller');

const router = express.Router();

router.get('/search-users-by-param', searchUserByParam);
router.get('/search-users-by-cpf-cnpj', searchUsersByCpfCnpj);
router.get('/search-users-by-document-id', searchUsersByDocumentId);
router.get('/search-users-with-doc-by-param', searchUsersWithDocByParam);
router.post('/upsert-user', upsertUser);
router.delete('/delete-user-by-id', deleteUserById);

module.exports = router;