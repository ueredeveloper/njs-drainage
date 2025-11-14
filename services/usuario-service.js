const { getClient } = require("../db");

exports.searchUserByParam = async (param) => {

    let client;

    try {
        // Obtém um cliente de conexão com o banco de dados
        client = await getClient();

        // Define a query SQL chamando a função PostgreSQL que realiza a busca
        const query = `select * from search_usuario_by_param($1) as result;`;

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

exports.searchUsersByCpfCnpj = async (param) => {

    let client;

    try {
        // Obtém um cliente de conexão com o banco de dados
        client = await getClient();

        // Define a query SQL chamando a função PostgreSQL que realiza a busca
        const query = `select search_users_by_cpf_cnpj($1) as result;`;

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

exports.searchUsersWithDocByParam = async (param) => {

    let client;

    try {
        // Obtém um cliente de conexão com o banco de dados
        client = await getClient();

        // Define a query SQL chamando a função PostgreSQL que realiza a busca
        const query = `select search_users_with_doc_by_param($1) as result;`;

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


exports.searchUsersByDocumentId = async (docId) => {

    let client;

    try {
        // Obtém um cliente de conexão com o banco de dados
        client = await getClient();

        // Define a query SQL chamando a função PostgreSQL que realiza a busca
        const query = `select * from search_users_by_document_id($1) as result;`;

        // Executa a query passando o parâmetro informado
        const { rows } = await client.query(query, [docId]);

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


exports.upsertUser = async (object) => {

    let client;

    try {
        // Obtém um cliente de conexão com o banco de dados
        client = await getClient();

        // Define a query SQL chamando a função PostgreSQL que realiza a busca
        const query = `select upsert_user($1) as result;`;

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


exports.deleteUsuerById = async (id) => {

    let client;

    try {
        // Obtém um cliente de conexão com o banco de dados
        client = await getClient();

        // Define a query SQL chamando a função PostgreSQL que realiza a busca
        const query = `select delete_user_by_id ($1) as result;`;

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