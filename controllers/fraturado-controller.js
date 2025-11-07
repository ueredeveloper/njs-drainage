const { findFraturadoSystemByPoint, listAllHydrogeoFraturado } = require("../services/fraturado-service");

exports.findFraturadoSystemByPoint = async (req, res) => {

    const { latitude, longitude } = req.query;
    try {
        const docs = await findFraturadoSystemByPoint(latitude, longitude);
        res.status(201).json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.listAllHydrogeoFraturado = async (req, res) => {

    try {
        const docs = await listAllHydrogeoFraturado();
        res.status(201).json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};