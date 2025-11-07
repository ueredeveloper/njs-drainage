const { findPorosoSystemByPoint, listAllHydrogeoPoroso } = require("../services/poroso-service");

exports.findPorosoSystemByPoint = async (req, res) => {

    const { latitude, longitude } = req.query;
    try {
        const docs = await findPorosoSystemByPoint(latitude, longitude);
        res.status(201).json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.listAllHydrogeoPoroso = async (req, res) => {

    try {
        const docs = await listAllHydrogeoPoroso();
        res.status(201).json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
