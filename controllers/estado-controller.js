
const { fetchAllStates } = require("../services/estado-service");

exports.fetchAllStates = async (req, res) => {

  let { param } = req.query;

  try {
    const docs = await fetchAllStates();
    res.status(201).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};