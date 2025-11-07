const { getClient } = require("../db");

/**
 * Serviço responsável por buscar documentos no banco de dados
 * de acordo com parâmetros informados.
 * 
 * A função utiliza a função SQL `search_documents_by_param(param)`
 * para realizar a busca e retorna apenas o array final de resultados.
 * 
 * @async
 * @function searchDocumentsByParam
 * @param {Object} param - Objeto JSON contendo os filtros ou parâmetros da busca.
 * Exemplo: `{ numero: "12345", tipoDocumento: "Ofício" }`
 * 
 * @returns {Promise<Array>} Retorna uma lista de documentos encontrados.
 * Caso nenhum registro seja encontrado, retorna um array vazio.
 * 
 * @throws {Error} Lança um erro se ocorrer falha na execução da query ou na conexão com o banco.
 */
exports.searchAddressByParam = async (param) => {

    let client;

    try {
        // Obtém um cliente de conexão com o banco de dados
        client = await getClient();

        // Define a query SQL chamando a função PostgreSQL que realiza a busca
        const query = `select * from search_address_by_param($1) as result;`;

        // Executa a query passando o parâmetro informado
        const { rows } = await client.query(query, [param]);

        // Extrai apenas o array final de resultados do campo "result"
        const data = rows[0]?.result || [];

        // Retorna o resultado processado
        return data;


    } catch (err) {
        // Loga o erro e relança para ser tratado em nível superior
        console.error('Error executing query:', err.stack);
        throw err; // Rethrow the error for the caller to handle
    } finally {
        // Encerra a conexão com o banco, independentemente de sucesso ou erro
        await client.end();
    }

}

exports.upsertAddress = async (object) => {

    let client;

    try {
        // Obtém um cliente de conexão com o banco de dados
        client = await getClient();

        // Define a query SQL chamando a função PostgreSQL que realiza a busca
        const query = `select upsert_address($1) as result;`;

        // Executa a query passando o parâmetro informado
        const { rows } = await client.query(query, [object]);

        // Extrai apenas o array final de resultados do campo "result"
        const data = rows[0]?.result || [];

        // Retorna o resultado processado
        return data;


    } catch (err) {
        // Loga o erro e relança para ser tratado em nível superior
        console.error('Error executing query:', err.stack);
        throw err; // Rethrow the error for the caller to handle
    } finally {
        // Encerra a conexão com o banco, independentemente de sucesso ou erro
        await client.end();
    }

}

exports.deleteAddress = async (id) => {

    let client;

    try {
        // Obtém um cliente de conexão com o banco de dados
        client = await getClient();

        // Define a query SQL chamando a função PostgreSQL que realiza a busca
        const query = `select delete_address($1) as result;`;

        // Executa a query passando o parâmetro informado
        const { rows } = await client.query(query, [id]);

        // Extrai apenas o array final de resultados do campo "result"
        const data = rows[0]?.result || [];

        // Retorna o resultado processado
        return data;


    } catch (err) {
        // Loga o erro e relança para ser tratado em nível superior
        console.error('Error executing query:', err.stack);
        throw err; // Rethrow the error for the caller to handle
    } finally {
        // Encerra a conexão com o banco, independentemente de sucesso ou erro
        await client.end();
    }

}