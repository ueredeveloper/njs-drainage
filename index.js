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

// Require the Azure endpoint router
const azureEndpoint = require('./azure/azure-endpoint');
const riversEndpoint = require('./rivers');
const { getClient } = require('./db');

// Mount the Azure endpoint
app.use('/azure', azureEndpoint);
app.use('/rivers', riversEndpoint);

// Allow only a specific origin
const corsOptions = {
  origin: '*',
};

app.use(cors(corsOptions));

//app.use(cors());
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

app.get('/', async (req, res) => {
  res.send("<b>njs - Arcgis!!!</b>");
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



app.post('/findSuperficialPointsInsidePolygon', async function (req, res) {

  console.log('findSuperficialPointsInsidePolygon');

  let polygon = convertionPolygonToPostgis(req.body);

  const { data, error } = await supabase
    .rpc('findsuperficialpointsinsidepolygon', { polygon: polygon })
  if (error) {
    console.log(error)
    res.send(error)
  } else {
    res.send(JSON.stringify(data))
  }
});

app.get('/findSuperficialPointsByUH', async function (req, res) {

  console.log('findSuperficialPointsInside UH', req.query.uh_codigo);

  let { uh_codigo } = req.query;

  const { data, error } = await supabase
    .rpc('find_superficial_points_by_uh', { uh_codigo: uh_codigo })
  if (error) {
    console.log(error)
    res.send(error)
  } else {

    res.json(data);
  }
});

app.get('/getShape', async function (req, res) {

  let { shape } = req.query;
  console.log('getShape', shape)

  const { data, error } = await supabase
    .from(shape)
    .select()
  if (error) {
    res.send(JSON.stringify(error))
  } else {
    res.send(JSON.stringify(data))
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
app.get('/findGrantsInsideShape', async function (req, res) {
  // Extrai os parâmetros de consulta da requisição.
  let { shapeName, shapeCode } = req.query;

  // Inicializa a variável para armazenar o nome da função Supabase.
  let mySupabaseFunction = null;

  // Determina qual função Supabase usar com base no nome da forma.
  if (shapeName === 'bacias_hidrograficas') {
    mySupabaseFunction = 'selectgrantsinsidebh';
  }
  else if (shapeName === 'unidades_hidrograficas') {
    mySupabaseFunction = 'selectgrantsinsideuh';
  }
  else if (shapeName === 'hidrogeo_fraturado') {
    mySupabaseFunction = 'selectgrantsinsidehf';
  } else if (shapeName === 'hidrogeo_poroso') {
    mySupabaseFunction = 'selectgrantsinsidehp'
  } else {
    // Envia uma resposta de erro se o nome da forma não for reconhecido.
    res.send({
      erro: `Envie o nome da shape: 
      pode ser bacias_hidrograficas, unidades_hidrograficas, 
      hidrogeo_fraturado ou hidrogeo_poroso`
    })
  }

  // Registra informações relevantes no console.
  //console.log('Encontrar subsídios na forma', shapeName, shapeCode)

  // Chama a função Supabase com base na função determinada e no código da forma.
  const { data, error } = await supabase
    .rpc(
      mySupabaseFunction, { shapecode: shapeCode }
    );

  // Lida com erros ou envia os dados obtidos como resposta.
  if (error) {
    console.log(error)
  } else {
    res.send(JSON.stringify(data))
  }
});

let port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("njs-drainage")
});
