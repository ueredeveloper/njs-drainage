const { listAllHydrographicUnits, findHydrographicUnitByPoint } = require("../services/unidades-hidrograficas-service");

exports.listAllHydrograficUnits = async (req, res) => {

  try {
    const docs = await listAllHydrographicUnits();
    res.status(201).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.findHydrographicUnitByPoint = async (req, res) => {

  let { latitude, longitude } = req.query;

  try {
    const object = await findHydrographicUnitByPoint(latitude, longitude);
    res.status(201).json(object);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
