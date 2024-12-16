const express = require('express');
const turf = require('@turf/turf');
const cors = require('cors');


/**
 * Roteador do Express para lidar com a filtragem de rios com base em coordenadas.
 * @type {express.Router}
 */
const router = express.Router();

const corsOptions = {
  origin: '*',
};

router.use(cors(corsOptions));


// Supondo que 'rios-df-141223.json' contenha recursos GeoJSON de rios
const rivers = require('../json/rios-df-141223.json');

/**
 * Endpoint GET para filtrar rios com base nas coordenadas do usuário.
 * @name GET/api/filterRiversByCoordinates
 * @function
 * @memberof module:routers/rivers
 * @param {string} lat - A latitude das coordenadas solicitadas pelo usuário.
 * @param {string} lng - A longitude das coordenadas solicitadas pelo usuário.
 * @returns {Object[]} closestLines - Uma matriz dos dez recursos de rio mais próximos das coordenadas do usuário.
 * @throws {Error} 400 - Requisição Inválida se os parâmetros de consulta obrigatórios (lat, lng) não forem fornecidos.
 * @throws {Error} 500 - Erro Interno do Servidor se ocorrer um erro inesperado.
 */
router.get('/filterRiversByCoordinates', (req, res) => {
    // Coordenada solicitada pelo usuário
    const { lat, lng } = req.query;

    // Converte para ponto
    const point = turf.point([lng, lat]);

    // Procura a distância entre o rio e a coordenada solicitada
    const nearestPoints = rivers.features.map((feature) => {
        let nearestPointOnLine = turf.nearestPointOnLine(feature.geometry, point);

        return {
            ...feature,
            nearestPointOnLine: nearestPointOnLine,
        };
    });

    // Ordena por proximidade com o ponto solicitado
    nearestPoints.sort((a, b) => a.nearestPointOnLine.properties.dist - b.nearestPointOnLine.properties.dist);

    // Escolhe os dez pontos mais próximos da coordenada solicitada
    const closestLines = nearestPoints.slice(0, 10).map(result => result);

    res.send(closestLines);
});

module.exports = router;
