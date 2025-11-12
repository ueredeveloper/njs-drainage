const { getClient } = require("../db");

exports.searchDocumentsByParamService = async (param) => {

    let client;

    try {
        // Obtém um cliente de conexão com o banco de dados
        client = await getClient();

        // Define a query SQL chamando a função PostgreSQL que realiza a busca
        const query = `select * from search_documents_by_param($1) as result;`;

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

exports.searchDocumentsByUserId = async (id) => {

    let client;

    try {
        // Obtém um cliente de conexão com o banco de dados
        client = await getClient();

        // Define a query SQL chamando a função PostgreSQL que realiza a busca
        const query = `select * from search_documents_by_user_id($1) as result;`;

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

exports.upsertDocument = async (object) => {

    let client;

    try {
        // Obtém um cliente de conexão com o banco de dados
        client = await getClient();

        // Define a query SQL chamando a função PostgreSQL que realiza a busca
        const query = `select upsert_document($1) as result;`;

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

exports.deleteDocument = async (id) => {

    let client;

    try {
        // Obtém um cliente de conexão com o banco de dados
        client = await getClient();

        // Define a query SQL chamando a função PostgreSQL que realiza a busca
        const query = `select delete_document($1) as result;`;

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


exports.deleteDocUserRelation = async (docId, userId) => {

    let client;

    try {
        // Obtém um cliente de conexão com o banco de dados
        client = await getClient();

        // Define a query SQL chamando a função PostgreSQL que realiza a busca
        const query = `select delete_doc_user_relation($1, $2) as result;`;

        // Executa a query passando o parâmetro informado
        const { rows } = await client.query(query, [docId, userId]);

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