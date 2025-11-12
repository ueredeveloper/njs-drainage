const { searchUserByParam, upsertUser, deleteUsuerById, searchUsersByDocumentId, searchUsersByCpfCnpj } = require("../services/usuario-service");


exports.searchUserByParam = async (req, res) => {

  let { param } = req.query;

  try {
    const docs = await searchUserByParam(param);
    res.status(201).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.searchUsersByCpfCnpj = async (req, res) => {

  let { param } = req.query;

  try {
    const docs = await searchUsersByCpfCnpj(param);
    res.status(201).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchUsersByDocumentId = async (req, res) => {

  let { docId } = req.query;

  try {
    const docs = await searchUsersByDocumentId(docId);
    res.status(201).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.upsertUser = async (req, res) => {
  try {
    const object = req.body; // recebe o JSON enviado no body

    if (!object) {
      return res.status(400).json({ error: 'Envie o endereço para salvar ou atualizar!' });
    }

    // chama o serviço que faz insert ou update
    const result = await upsertUser(object);

    // retorna o array de endereços atualizado
    res.status(200).json(result);

  } catch (err) {
    console.error('Error in upsertUser controller:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUserById = async (req, res) => {

  let { id } = req.query;

  try {
    const docs = await deleteUsuerById(id);
    res.status(201).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

