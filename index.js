const express = require('express');
//require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
let turf = require('@turf/turf');
const { createClient } = require('@supabase/supabase-js');
const drainage_area = require('./json/a-d-bho-211022.json');
const { convertionPolygonToPostgis } = require('./tools');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
app.use(express.json());

// Require the Azure endpoint router
const azureEndpoint = require('./azure/azure-endpoint');
const riversEndpoint = require('./rivers');
const { getClient } = require('./db');
const { searchDocumentsByParam, getDocumentTypes, searchAddressByParam,
  fetchAllStates, fetchAllDomainTables, deleteAddress,
  upsertAddress, searchUsersByParam, searchDocumentsByUserId,
  upsertUser, deleteUserById,
  searchProcessByParam,
  upsertProcess,
  deleteProcess,
  searchAttachmentByParam,
  upsertAttachment,
  deleteAttachment,
  listAllHydrograficBasins,
  listAllHydrograficUnits, 
  findHydrographicUnitByPoint,
  findHydrographicBasinByPoint,
  findFraturadoSystemByPoint,
  findPorosoSystemByPoint,
  listAllHydrogeoFraturado,
  listAllHydrogeoPoroso,
  searchInterferencesByParam,
  upsertInterference,
  deleteInterference,
  deletePurpose,
  upsertDocument,
  deleteDocument,
  deleteDocUserRelation,
  searchUsersByDocumentId,
  searchUsersByCpfCnpj,
  searchUsersWithDocByParam,
  searchInterferencesByAddressId,

} = require('./routes');

// Allow only a specific origin
const corsOptions = {
  origin: 'https://app-sis-out-srh-front-01-htd0hnf6fce0cdem.brazilsouth-01.azurewebsites.net',
  methods: ['GET'],
  credentials: false, // se você usa cookies/autenticação
};

app.use(cors(corsOptions));


// Mount the Azure endpoint
app.use('/azure', azureEndpoint);
app.use('/rivers', riversEndpoint);

app.use('/documents', searchDocumentsByParam)
app.use('./documents', searchDocumentsByUserId)

app.use('/document-types', getDocumentTypes)

app.use('/addresses', searchAddressByParam)
app.use('/addresses', upsertAddress)

app.use('/addresses', deleteAddress)

app.use('/states', fetchAllStates)
app.use('/domains', fetchAllDomainTables)

app.use('/users', searchUsersByParam)
app.use('/users', searchUsersByCpfCnpj)
app.use('/users', searchUsersByDocumentId)
app.use('/users', upsertUser)
app.use('/users', deleteUserById)
app.use('/users', searchUsersWithDocByParam)


app.use('/processes', searchProcessByParam)
app.use('/processes', upsertProcess)
app.use('/processes', deleteProcess)

app.use('/attachments', searchAttachmentByParam)
app.use('/attachments', upsertAttachment)
app.use('/attachments', deleteAttachment)

app.use('/hydrographic-basins', listAllHydrograficBasins)
app.use('/hydrographic-basins', findHydrographicBasinByPoint)

app.use('/hydrographic-units', listAllHydrograficUnits)
app.use('/hydrographic-units', findHydrographicUnitByPoint  )

app.use('/hydrogeo-fraturado', findFraturadoSystemByPoint)
app.use('/hydrogeo-fraturado', listAllHydrogeoFraturado)

app.use('/hydrogeo-poroso', findPorosoSystemByPoint )
app.use('/hydrogeo-poroso', listAllHydrogeoPoroso)

app.use('/interferences', searchInterferencesByParam)
app.use('/interferences', searchInterferencesByAddressId)
app.use('/interferences', searchUsersByCpfCnpj)
app.use('/interferences', upsertInterference)
app.use('/interferences', deleteInterference)

app.use('/purposes', deletePurpose)

app.use('/documents', upsertDocument)
app.use('/documents', deleteDocument)
app.use('/documents', deleteDocUserRelation)


//app.use(cors());
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

app.get('/', async (req, res) => {
  res.send("<b>NJS-JS-DRAINAGE - BACKEND!!!</b>");
});

app.get('/drainage', (req, res) => {
  console.log(
    'get drainage lat: ', req.query.lat,
    'lng: ', req.query.lng,
    'uh: ', req.query.uh
  );

  let p = turf.point([req.query.lng, req.query.lat]);
  let uh = Number(req.query.uh);
  // filtra os polígonos por unidade hidrográfica - uh
  let _drainage_area = drainage_area.features.filter(feature => {
    return Number(feature.attributes.UH_rotulo) === uh
  })
  //console.log(_drainage_area.length)
  // busca em vários polígonos o polígono ao qual o ponto pertence
  let feature = _drainage_area.find((_d_a, i) => {
    return turf.booleanPointInPolygon(p, turf.polygon(_d_a.geometry.rings))
  });
  // busca polígonos a montante
  let features = _drainage_area.filter((f, i) => {
    return f.attributes.cobacia >= feature.attributes.cobacia && f.attributes.cocursodag.startsWith(feature.attributes.cocursodag);
  });
  // retorna os polígonos filtrados
  res.send(JSON.stringify(features));
});

app.get('/find-points-inside-subsystem', async function (req, res) {

  let { tp_id, lat, lng } = req.query

  let client;

  try {
    // Connect to the database
    // await client.connect();
    client = await getClient();

    // Define the SQL query and parameter
    const query = `SELECT * FROM find_all_points_in_a_subsystem($1, $2);`;
    const values = [`SRID=4674;POINT(${lng} ${lat})`, tp_id]; // Parameters for the query

    // Execute the query
    const result = await client.query(query, values);

    // Log or process the results
    //console.log('Query Results:', result.rows);

    res.send(JSON.stringify(result.rows));

    //return result.rows; // Return the rows if needed
  } catch (err) {
    console.error('Error executing query:', err.stack);
    throw err; // Rethrow the error for the caller to handle
  } finally {
    // Disconnect from the database
    await client.end();
  }


});

/**
 * Rota GET para buscar bacias Otto a partir de coordenadas geográficas (latitude e longitude).
 *
 * @route GET /find-otto-basins-by-lat-lng
 * @query {number} lat - Latitude da coordenada de busca.
 * @query {number} lng - Longitude da coordenada de busca.
 * @returns {JSON} Retorna uma lista de bacias Otto que intersectam com as coordenadas fornecidas.
 *
 * @example
 
 */
app.get('/find-otto-basins-by-lat-lng', async function (req, res) {

  let { lat, lng } = req.query

  let client;

  try {
    // Connect to the database
    // await client.connect();
    client = await getClient();

    // Define the SQL query and parameter
    const query = `SELECT * FROM find_otto_basins_by_lat_lng ($1, $2)`;
    const values = [lat, lng]; // Parameters for the query

    // Execute the query
    const result = await client.query(query, values);

    // Log or process the results
    //console.log('Query Results:', result.rows);

    res.send(JSON.stringify(result.rows));

    //return result.rows; // Return the rows if needed
  } catch (err) {
    console.error('Error executing query:', err.stack);
    throw err; // Rethrow the error for the caller to handle
  } finally {
    // Disconnect from the database
    await client.end();
  }


});

/**
 * @description Rota para buscar pontos dentro de um polígono.
 * O polígono deve ser enviado no corpo da requisição no formato adequado
 * e será convertido para o formato PostGIS.
 * 
 * Exemplo de polígono:
 * [
 *   [
 *     -47.7544875523551,
 *     -15.780516245814807
 *   ],
 *   ...
 * ]
 * 
 * @route POST /find-points-inside-polygon
 * @param {Object} req - Objeto de requisição contendo o corpo com os dados do polígono.
 * @param {Object} res - Objeto de resposta para enviar os resultados ou erros.
 */
app.post('/find-points-inside-polygon', async function (req, res) {

  let polygon = convertionPolygonToPostgis(req.body);

  let client;

  try {
    // Connect to the database
    // await client.connect();
    client = await getClient();

    // Define the SQL query and parameter
    const query = `SELECT * FROM find_points_inside_polygon($1);`;
    const values = [polygon]; // Parameters for the query

    // Execute the query
    const result = await client.query(query, values);

    // Log or process the results
    //console.log('Query Results:', result.rows);

    res.send(JSON.stringify(result.rows));

    //return result.rows; // Return the rows if needed
  } catch (err) {
    console.error('Error executing query:', err.stack);
    throw err; // Rethrow the error for the caller to handle
  } finally {
    // Disconnect from the database
    await client.end();
  }

});

/**
 * @description Rota para buscar pontos dentro de um retângulo solicitado pelo usuário.
 * O retângulo deve ser enviado no corpo da requisição no formato adequado.
 * 
 * Exemplo de retângulo:
 * {
    "nex": -47.7544875523551,
    "ney": -15.828085825327648,
    "swx": -47.728395023058226,
    "swy": -15.805623805877323
  }
 * 
 * @route POST /find-points-inside-rectangle
 * @param {Object} req - Objeto de requisição contendo o corpo com os dados do retângulo.
 * @param {Object} res - Objeto de resposta para enviar os resultados ou erros.
 */
app.post('/find-points-inside-rectangle', async function (req, res) {

  let { nex, ney, swx, swy } = req.body;

  let client;

  try {
    // Connect to the database
    // await client.connect();
    client = await getClient();

    // Define the SQL query and parameter
    const query = `SELECT * FROM find_points_inside_rectangle($1, $2, $3, $4);`;
    const values = [nex, ney, swx, swy]; // Parameters for the query

    // Execute the query
    const result = await client.query(query, values);

    // Log or process the results
    //console.log('Query Results:', result.rows);

    res.send(JSON.stringify(result.rows));

    //return result.rows; // Return the rows if needed
  } catch (err) {
    console.error('Error executing query:', err.stack);
    throw err; // Rethrow the error for the caller to handle
  } finally {
    // Disconnect from the database
    await client.end();
  }




});

/**
 * @description Rota para buscar pontos dentro de um cículo solicitado pelo usuário.
 * O usuário enviará o centro e o raio do círculo.
 * 
 * Exemplo de círculo:
 * {
      "center": {
        "lng": -47.755860843370726,
        "lat": -15.743509964163012
      },
      "radius": 2632
    }
 * 
 * @route POST /find-points-inside-circle
 * @param {Object} req - Objeto de requisição contendo o corpo com os dados do retângulo.
 * @param {Object} res - Objeto de resposta para enviar os resultados ou erros.
 */
app.post('/find-points-inside-circle', async function (req, res) {
  let { center, radius } = req.body;

  let client;

  try {
    // Connect to the database
    // await client.connect();
    client = await getClient();

    // Define the SQL query and parameter
    const query = `SELECT * FROM find_points_inside_circle($1, $2);`;
    const values = [`POINT(${center.lng} ${center.lat})`, radius]; // Parameters for the query

    // Execute the query
    const result = await client.query(query, values);

    // Log or process the results
    //console.log('Query Results:', result.rows);

    res.send(JSON.stringify(result.rows));

    //return result.rows; // Return the rows if needed
  } catch (err) {
    console.error('Error executing query:', err.stack);
    throw err; // Rethrow the error for the caller to handle
  } finally {
    // Disconnect from the database
    await client.end();
  }
});

/**
 * @description Rota para buscar pontos superficiais dentro de um polígono.
 * O polígono deve ser enviado no corpo da requisição no formato adequado
 * e será convertido para o formato PostGIS.
 * 
 * Exemplo de polígono:
 * [
 *   [
 *     -47.7544875523551,
 *     -15.780516245814807
 *   ],
 *   ...
 * ]
 * 
 * @route POST /find-points-inside-polygon
 * @param {Object} req - Objeto de requisição contendo o corpo com os dados do polígono.
 * @param {Object} res - Objeto de resposta para enviar os resultados ou erros.
 */
app.post('/find-superficial-points-inside-polygon', async function (req, res) {

  let polygon = convertionPolygonToPostgis(req.body);

  let client;

  try {
    // Connect to the database
    // await client.connect();
    client = await getClient();

    // Define the SQL query and parameter
    const query = `SELECT * FROM find_superficial_points_inside_polygon($1);`;
    const values = [polygon]; // Parameters for the query

    // Execute the query
    const result = await client.query(query, values);

    // Log or process the results
    //console.log('Query Results:', result.rows);

    res.send(JSON.stringify(result.rows));

    //return result.rows; // Return the rows if needed
  } catch (err) {
    console.error('Error executing query:', err.stack);
    throw err; // Rethrow the error for the caller to handle
  } finally {
    // Disconnect from the database
    await client.end();
  }

  /*
  const { data, error } = await supabase
    .rpc(' ', { polygon: polygon })
  if (error) {
    console.log(error)
    res.send(error)
  } else {
    res.send(JSON.stringify(data))
  }
  */


});

/**
 * @description Rota para buscar pontos superficiais pelo código da Unidade Hidrográfica
 * 
 * Esta forma é a anterior que é utilizado no replit para o projeto njs-js-drainage. O projeto novo, 
 * com todos os projetos juntos (Geral, Subterrânea, Superficial) utilizará outra função.
 * 
 * Exemplo: 
 * uh_codigo = 3
 * 
 * @route GET /find-superficial-points-by-uh-codigo
 * @param {Object} req - Objeto de requisição contendo o corpo com os dados do polígono.
 * @param {Object} res - Objeto de resposta para enviar os resultados ou erros.
 */
app.get('/find-superficial-points-by-uh-codigo', async function (req, res) {

  let { uh_codigo } = req.query;

  let client;

  try {
    // Connect to the database
    // await client.connect();
    client = await getClient();

    // Define the SQL query and parameter
    const query = `SELECT * FROM find_superficial_points_by_uh_codigo($1);`;
    const values = [uh_codigo]; // Parameters for the query

    // Execute the query
    const result = await client.query(query, values);

    // Log or process the results
    //console.log('Query Results:', result.rows);

    res.send(JSON.stringify(result.rows));

    //return result.rows; // Return the rows if needed
  } catch (err) {
    console.error('Error executing query:', err.stack);
    throw err; // Rethrow the error for the caller to handle
  } finally {
    // Disconnect from the database
    await client.end();
  }

});

/**
 * @description Rota para buscar pontos superficiais pelo código da Unidade Hidrográfica
 * 
 * Este novo mode padroniza a entrega das outorgas superficiais no padrão do projeto que une todos os projetos (Geral, Subterrânea e Superficial)
 * 
 * Exemplo: 
 * uh_codigo = 3
 * 
 * @route GET /find-superficial-points-by-uh-codigo
 * @param {Object} req - Objeto de requisição contendo o corpo com os dados do polígono.
 * @param {Object} res - Objeto de resposta para enviar os resultados ou erros.
 */
app.get('/find-surface-pointos-inside-uh', async function (req, res) {

  let { uh_codigo } = req.query;

  let client;

  try {
    // Connect to the database
    // await client.connect();
    client = await getClient();

    // Define the SQL query and parameter
    const query = `SELECT * FROM find_surface_points_inside_uh($1);`;
    const values = [uh_codigo]; // Parameters for the query

    // Execute the query
    const result = await client.query(query, values);

    res.send(JSON.stringify(result.rows));

  } catch (err) {
    console.error('Error executing query:', err.stack);
    throw err; // Rethrow the error for the caller to handle
  } finally {
    // Disconnect from the database
    await client.end();
  }

});


/**
 * @description Busca shapes como Bacias Hidrográficas, Unidades Hidrográficas pelo nome da tabela no banco de dados.
 * 
 * 
 * Exemplo: 
 * shape_name = unidades_hidrograficas ou hidrogeo_fraturado
 * 
 * @route GET /find-shape-by-name
 * @param {Object} req - Objeto de requisição contendo o corpo com os dados do polígono.
 * @param {Object} res - Objeto de resposta para enviar os resultados ou erros.
 */
app.get('/find-shape-by-name', async function (req, res) {

  let { shape_name } = req.query;

  let client;

  try {
    // Validate the shape_name to prevent SQL injection
    const allowedShapes = ['bacias_hidrograficas', 'unidades_hidrograficas', 'hidrogeo_fraturado', 'hidrogeo_poroso'];
    if (!allowedShapes.includes(shape_name)) {
      return res.status(400).send({ error: 'Invalid shape name' });
    }

    // Connect to the database
    client = await getClient();

    // Define the SQL query and parameter
    const query = `SELECT * FROM find_shape_by_name($1)`;
    const values = [shape_name]; // Parameters for the query

    // Execute the query
    const result = await client.query(query, values);

    // Obtem os objectos no formato correto para o front end
    let arrays = result.rows[0].find_shape_by_name.map(ssbn => ssbn.shape)

    res.send(JSON.stringify(arrays));

  } catch (err) {
    console.error('Error executing query:', err.stack);
    res.status(500).send({ error: 'Internal server error' });
  } finally {
    // Disconnect from the database
    if (client) {
      await client.end();
    }
  }
});


/**
 * Busca todos os pontos outorgados, incluindo subterrâneo, superficial, lançamento de efluentes,
 * lançamentos pluviais e barragens, de acordo com o parâmetro de pesquisa fornecido.
 * A pesquisa é realizada em múltiplos campos, como nome do usuário, CPF/CNPJ, endereço da empresa, 
 * número do processo e número do ato. Todos os campos são pesquisados com a cláusula `ILIKE`, permitindo
 * buscas parciais (case-insensitive).
 *
 * @param {string} searchQuery - A string de pesquisa utilizada para buscar nos campos `us_nome`, 
 *                                `us_cpf_cnpj`, `emp_endereco`, `int_processo`, `int_num_ato` de diversas tabelas.
 *                                A pesquisa será realizada de forma case-insensitive e com o operador `ILIKE` 
 *                                para encontrar correspondências parciais. 
 *                                Exemplo: 'Carlos', '123456789', etc.
 *
 * @returns {Promise<object>} Retorna uma Promise com um objeto contendo os dados das várias tabelas, 
 *                            onde cada chave é o nome de uma tabela e o valor é um array de registros correspondentes.
 *                            Exemplo de formato:
 *                            {
 *                              subterranea: [...],
 *                              superficial: [...],
 *                              barragem: [...],
 *                              lancamento_efluentes: [...],
 *                              lancamento_pluviais: [...]
 *                            }
 */
app.get('/find-points-by-keyword', async function (req, res) {

  let { keyword } = req.query;

  let client;

  try {
    // Connect to the database
    // await client.connect();
    client = await getClient();

    // Define the SQL query and parameter
    const query = `SELECT * FROM find_all_points($1);`;
    const values = [keyword]; // Parameters for the query

    // Execute the query
    const result = await client.query(query, values);

    // Log or process the results
    //console.log('Query Results:', result.rows);

    res.send(JSON.stringify(result.rows));

    //return result.rows; // Return the rows if needed
  } catch (err) {
    console.error('Error executing query:', err.stack);
    throw err; // Rethrow the error for the caller to handle
  } finally {
    // Disconnect from the database
    await client.end();
  }


});
/**
 * Rota para encontrar subsídios dentro de uma forma geográfica específica.
 *
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>} - Promessa para lidar com a lógica assíncrona da rota.
 */
app.get('/find_points-inside-shape', async function (req, res) {
  // Extrai os parâmetros de consulta da requisição.
  let { shapeName, shapeCode } = req.query;

  // Inicializa a variável para armazenar o nome da função Supabase.
  let mySupabaseFunction = null;

  // Determina qual função Supabase usar com base no nome da forma.
  if (shapeName === 'bacias_hidrograficas') {
    mySupabaseFunction = 'find_points_inside_bacia_hidrografica';
  }
  else if (shapeName === 'unidades_hidrograficas') {
    mySupabaseFunction = 'find_points_inside_unidade_hidrografica';
  }
  else if (shapeName === 'hidrogeo_fraturado') {
    mySupabaseFunction = 'find_points_inside_hidrogeo_fraturado';
  } else if (shapeName === 'hidrogeo_poroso') {
    mySupabaseFunction = 'find_points_inside_hidrogeo_poroso'
  } else {
    // Envia uma resposta de erro se o nome da forma não for reconhecido.
    res.send({
      erro: `Envie o nome da shape: 
      pode ser bacias_hidrograficas, unidades_hidrograficas, 
      hidrogeo_fraturado ou hidrogeo_poroso`
    })
  }

  let client;

  try {
    // Connect to the database
    // await client.connect();
    client = await getClient();

    // Define the SQL query and parameter
    const query = `SELECT * FROM ${mySupabaseFunction}($1);`;
    const values = [shapeCode]; // Parameters for the query

    // Execute the query
    const result = await client.query(query, values);

    // Log or process the results
    //console.log('Query Results:', result.rows);

    res.send(JSON.stringify(result.rows));

    //return result.rows; // Return the rows if needed
  } catch (err) {
    console.error('Error executing query:', err.stack);
    throw err; // Rethrow the error for the caller to handle
  } finally {
    // Disconnect from the database
    await client.end();
  }


});

let port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("njs-drainage")
});
