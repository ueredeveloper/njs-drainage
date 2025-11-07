

// Documento
const searchDocumentsByParam = require('./documento-route');
const searchDocumentsByUserId = require('./documento-route');


// Tipo de Documento
const getDocumentTypes = require('./tipo-documento-route');

// Endereço
const searchAddressByParam = require('./endereco-route');
const upsertAddress = require('./endereco-route');
const deleteAddress = require('./endereco-route');

// Estado
const fetchAllStates = require('./estado-route');

// Tabelas de Domínio
const fetchAllDomainTables = require('./dominio-route')

// Usuarios
const searchUsersByParam = require('./usuario-route');
const searchUsersByDocumentId = require('./usuario-route');
const upsertUser = require('./usuario-route');
const deleteUserById = require('./usuario-route');
const searchProcessByParam = require('./processo-router');
const upsertProcess = require('./processo-router');
const deleteProcess = require('./processo-router');

const searchAttachmentByParam = require('./anexo-route');
const upsertAttachment = require('./anexo-route');
const deleteAttachment = require('./anexo-route');

const listAllHydrograficBasins = require('./bacias-hidrograficas-route');
const listAllHydrograficUnits = require('./unidades-hidrograficas-route');

const findHydrographicBasinByPoint = require('./bacias-hidrograficas-route');
const findHydrographicUnitByPoint = require('./unidades-hidrograficas-route');
const findFraturadoSystemByPoint = require('./fraturado-route');
const findPorosoSystemByPoint = require('./poroso-route');

const listAllHydrogeoFraturado = require('./fraturado-route');
const listAllHydrogeoPoroso = require('./poroso-route');

const searchInterferencesByParam = require('./interferencia-route');
const upsertInterference = require('./interferencia-route');
const deleteInterference = require('./interferencia-route');

const deletePurpose = require('./finalidade-route');

const upsertDocument = require('./documento-route');
const deleteDocument = require('./documento-route');
const deleteDocUserRelation = require('./documento-route');


module.exports = {
    // documentos
    searchDocumentsByParam,
    searchDocumentsByUserId,

    // tipos de documentos
    getDocumentTypes,

    // endereços
    searchAddressByParam,
    upsertAddress,
    deleteAddress,

    // estado
    fetchAllStates,
    // tabelas de domínio
    fetchAllDomainTables,

    // usuários
    searchUsersByParam,
    searchUsersByDocumentId,
    upsertUser,
    deleteUserById,

    // processo
    searchProcessByParam,
    upsertProcess,
    deleteProcess, 

    // anexo
    searchAttachmentByParam,
    upsertAttachment,
    deleteAttachment, 

    listAllHydrograficBasins,

    listAllHydrograficUnits,

    findHydrographicBasinByPoint,

    findHydrographicUnitByPoint, 

    findFraturadoSystemByPoint,
    findPorosoSystemByPoint,

    listAllHydrogeoFraturado,
    listAllHydrogeoPoroso, 

    searchInterferencesByParam,
    upsertInterference,
    deleteInterference, 

    deletePurpose,

    upsertDocument,
    deleteDocument,
    deleteDocUserRelation

}