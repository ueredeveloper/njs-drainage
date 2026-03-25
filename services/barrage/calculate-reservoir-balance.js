const express = require('express');
const cors = require('cors');

const { getClient } = require('../../db');
const { calcularReservatorios } = require('./calculate-reservoir');

/**
 * Roteador do Express para lidar com a filtragem de rios com base em coordenadas.
 * @type {express.Router}
 */
const router = express.Router();

const corsOptions = {
    origin: '*',
};

router.use(cors(corsOptions));

router.post('/calculate-reservoir-balance', async (req, res) => {
  
    try {
        const inputJson = JSON.stringify(req.body);

          // Obtém um cliente de conexão com o banco de dados
        client = await getClient();

        // Chama a função no banco de dados
        const query = `SELECT calculate_reservoir_water_balance($1::jsonb) as resultado`;
        const { rows } = await client.query(query, [inputJson]);

        // Retorna o JSON resultante da função do banco
        const dbResult = rows[0].resultado;

        // Prepara dados para cálculo: Usa QmmRegionalizada como Qmmm
        if (dbResult.operacao && dbResult.operacao.QmmRegionalizada) {
            dbResult.operacao.Qmmm = dbResult.operacao.QmmRegionalizada;
        }

        const resultadoCalculo = calcularReservatorios(dbResult);

        
        res.json({ dbResult, resultadoCalculo });

    } catch (error) {
        console.error("Erro no banco:", error);
        res.status(500).json({ error: "Erro ao processar no banco de dados: " + error.message });
    }
});

module.exports = router;



