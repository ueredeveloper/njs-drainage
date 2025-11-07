const { listAllHydrographicBasins, findHydrographicBasinByPoint } = require("../services/bacias-hidrograficas-service");

exports.listAllHydrograficBasins = async (req, res) => {

  try {
    const docs = await listAllHydrographicBasins();
    res.status(201).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.findHydrographicBasinByPoint = async (req, res) => {

  let { latitude, longitude } = req.query;

  try {
    const object = await findHydrographicBasinByPoint(latitude, longitude);
    res.status(201).json(object);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};