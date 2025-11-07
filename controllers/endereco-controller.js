const { searchAddressByParam, upsertAddress, deleteAddress } = require("../services/endereco-service");

exports.searchAddressByParam = async (req, res) => {

  let { param } = req.query;

  try {
    const docs = await searchAddressByParam(param);
    res.status(201).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.upsertAddress = async (req, res) => {
  try {
    const object = req.body; // recebe o JSON enviado no body

    if (!object) {
      return res.status(400).json({ error: 'Envie o endereço para salvar ou atualizar!' });
    }

    // chama o serviço que faz insert ou update
    const result = await upsertAddress(object);

    // retorna o array de endereços atualizado
    res.status(200).json(result);

  } catch (err) {
    console.error('Error in upsertAddress controller:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAddress = async (req, res) => {

  let { id } = req.query;

  try {
    const docs = await deleteAddress(id);
    res.status(201).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
