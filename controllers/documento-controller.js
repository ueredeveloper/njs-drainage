const { searchDocumentsByParamService, searchDocumentsByUserId, upsertDocument, deleteDocument, deleteDocUserRelation } = require("../services/documento-service");

exports.searchDocumentsByParam = async (req, res) => {

  let { param } = req.query;

  try {
    const docs = await searchDocumentsByParamService(param);
    res.status(201).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchDocumentsByUserId = async (req, res) => {

  let { id } = req.query;

  try {
    const docs = await searchDocumentsByUserId(id);
    res.status(201).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.upsertDocument = async (req, res) => {
  try {
    const object = req.body; // recebe o JSON enviado no body

    if (!object) {
      return res.status(400).json({ error: 'Envie um documento para salvar ou atualizar!' });
    }

    // chama o serviço que faz insert ou update
    const result = await upsertDocument(object);

    // retorna o array de endereços atualizado
    res.status(200).json(result);

  } catch (err) {
    console.error('Error in upsert_document controller:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDocument = async (req, res) => {

  let { id } = req.query;

  try {
    const docs = await deleteDocument(id);
    res.status(201).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.deleteDocUserRelation = async (req, res) => {

  let { docId, userId } = req.query;

  try {
    const docs = await deleteDocUserRelation(docId, userId);
    res.status(201).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
