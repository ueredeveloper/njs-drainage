const { deletePurpose } = require("../services/finalidade-service");


exports.deletePurpose = async (req, res) => {

  let { id } = req.query;

  try {
    const docs = await deletePurpose(id);
    res.status(201).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
