const {getDocumentTypesService} = require("../services/tipo-documento-service");

exports.getDocumentTypesController = async (req, res) => {

    try {
        const objects = await getDocumentTypesService();
        res.status(201).json(objects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};