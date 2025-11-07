const { fetchAllDomainTables } = require("../services/dominio-service");


exports.fetchAllDomainTables = async (req, res) => {

    try {
        const docs = await fetchAllDomainTables();
        res.status(201).json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};