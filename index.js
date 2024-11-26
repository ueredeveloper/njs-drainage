const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
let turf = require('@turf/turf');
const { createClient } = require('@supabase/supabase-js');
const drainage_area = require('./json/a-d-bho-211022.json');
const { convertionPolygonToPostgis } = require('./tools');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Atualização para enviar para o azure

const app = express();

// Require the Azure endpoint router
const azureEndpoint = require('./azure/azure-endpoint');
const riversEndpoint = require('./rivers');

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

app.get('/findPointsInASystem', async function(req, res) {

  let { tp_id, lat, lng } = req.query

  console.log(tp_id, lat, lng)

  const { data, error } = await supabase
    .rpc('findpointsinasystem', { point: `SRID=4674;POINT(${lng} ${lat})`, tp_id: tp_id })
  if (error) {
    res.send(JSON.stringify(error))
  } else {
    res.send(JSON.stringify(data))
  }

});
app.get('/findAllPointsInASubsystem', async function(req, res) {

  let { tp_id, lat, lng } = req.query

  console.log(tp_id, lat, lng)

  const { data, error } = await supabase
    .rpc('find_all_points_in_a_subsystem', { point: `SRID=4674;POINT(${lng} ${lat})`, tp_id: tp_id })
  if (error) {
    res.send(JSON.stringify(error))
  } else {
    res.send(JSON.stringify(data))
  }

});

app.post('/findPointsInsidePolygon', async function(req, res) {

  let polygon = convertionPolygonToPostgis(req.body);

  console.log(polygon)

  ////console.log(polygon)
  const { data, error } = await supabase
    .rpc('findpointsinsidepolygon', { polygon: polygon })
  if (error) {
    //console.log(error)
  } else {
    res.send(JSON.stringify(data))
  }
});

app.post('/findPointsInsideRectangle', async function(req, res) {

  let { nex, ney, swx, swy } = req.body;

  const { data, error } = await supabase
    .rpc('findpointsinsiderectangle', { nex: nex, ney: ney, swx: swx, swy: swy })
  if (error) {
    //console.log(error)
  } else {
    res.send(JSON.stringify(data))
  }
});

app.post('/findPointsInsideCircle', async function(req, res) {
  let { center, radius } = req.body;

  console.log(`POINT(${center.lng} ${center.lat})`, parseInt(radius))

  const { data, error } = await supabase
    .rpc(
      'findpointsinsidecircle',
      { center: `POINT(${center.lng} ${center.lat})`, radius: parseInt(radius) }
    );

  if (error) {
    //console.log(error)
  } else {
    res.send(JSON.stringify(data))
  }
});

app.post('/findPointsInsidePolygon', async function(req, res) {

  let polygon = convertionPolygonToPostgis(req.body);

  const { data, error } = await supabase
    .rpc('findpointsinsidepolygon', { polygon: polygon })
  if (error) {
    console.log(error)
  } else {
    res.send(JSON.stringify(data))
  }
});

app.post('/findSuperficialPointsInsidePolygon', async function(req, res) {

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

app.get('/findSuperficialPointsByUH', async function(req, res) {

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

app.get('/getShape', async function(req, res) {

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
// POST method route
app.post('/findAllPointsInPolygon', async (req, res) => {

  console.log('find all points in polygon')
  try {

    let polygon = convertionPolygonToPostgis(req.body);

    // Call Supabase function
    const { data, error } = await supabase.rpc('find_all_points_in_polygon', { polygon: polygon })

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.post('/findAllPointsInRectangle', async (req, res) => {
  try {
    /**
     * @typedef {Object} RequestBody
     * @property {number} xmin The minimum X coordinate of the rectangle
     * @property {number} ymin The minimum Y coordinate of the rectangle
     * @property {number} xmax The maximum X coordinate of the rectangle
     * @property {number} ymax The maximum Y coordinate of the rectangle
     */

    /** @type {RequestBody} */
    const { xmin, ymin, xmax, ymax } = req.body;

    // Call Supabase function
    const { data, error } = await supabase.rpc('find_all_points_in_rectangle', {
      xmin,
      ymin,
      xmax,
      ymax
    });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.post('/findAllPointsInCircle', async function(req, res) {
  let { center, radius } = req.body;

  console.log('all circle', `POINT(${center.lng} ${center.lat})`, parseInt(radius))

  const { data, error } = await supabase
    .rpc(
      'find_all_points_in_circle',
      { center: `POINT(${center.lng} ${center.lat})`, radius: parseInt(radius) }
    );

  if (error) {
    console.log(error)
  } else {
    res.send(JSON.stringify(data))
  }
});

app.get('/findAllPoints', async function(req, res) {
  let { searchQuery } = req.query;

  const { data, error } = await supabase
    .rpc(
      'find_all_points', { searchquery: searchQuery }
    );

  if (error) {
    console.log(error)
  } else {
    res.send(JSON.stringify(data))
  }
});
/**
 * Rota para encontrar subsídios dentro de uma forma geográfica específica.
 *
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>} - Promessa para lidar com a lógica assíncrona da rota.
 */
app.get('/findGrantsInsideShape', async function(req, res) {
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
