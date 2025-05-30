const express = require("express");
const cors = require("cors");

const router = express.Router();
router.use(cors());

const xml2js = require("xml2js");
const sql = require("mssql");
const { getUsers, getDemands, getOttoBasins } = require("./queries.js");

const { SQLDATABASE, SQLHOST, SQLUSERNAME, SQLPASSWORD } = process.env;

// configurações do banco
const config = {
  user: SQLUSERNAME,
  password: SQLPASSWORD,
  server: SQLHOST,
  database: SQLDATABASE,
  trustServerCertificate: true,
};

/**
 * Buscar um usuário a partir de busca de nome, cpf, documento sei ou processo sei
 * @param {string} us_nome Nome do usuário.
 * @param {string} us_cpf_cnpj CPF ou CNPJ do usuário.
 * @param {string} doc_sei Documento no sistema SEI.
 * @param {string} proc_sei Processo no sistema SEI.
 * @return {Array} Retorna uma array com usuários selecionados, endereço, documento relacionado e processo.
 */
router.get("/getUsuarios", function (req, res) {
  let { us_nome, us_cpf_cnpj, doc_sei, proc_sei } = req.query;

  if (us_nome === "") {
    us_nome = "XXXXXXXXXXX";
  }
  if (us_cpf_cnpj === "") {
    us_cpf_cnpj = "XXXXXXXXXXX";
  }
  if (doc_sei === "") {
    doc_sei = "XXXXXXXXXXX";
  }
  if (proc_sei === "") {
    proc_sei = "XXXXXXXXXXX";
  }

  //conexão com o banco
  sql.connect(config, function (err) {
    if (err) console.log(err);

    // criar requirisão
    var request = new sql.Request();

    let query = getUsers(us_nome, us_cpf_cnpj, doc_sei, proc_sei);

    // requisição
    request.query(query, function (err, recordset) {
      if (err) {
        console.log(err);
      }

      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");

    
      // Verificar se o recordset está definido e possui dados
      if (recordset && recordset.recordsets && recordset.recordsets[0]) {
        res.send(JSON.stringify(recordset.recordsets[0]));
      } else {
        res.status(404).send("No records found");
      }
      
    });
  });
});

/**
 * Buscar finalidades autorizadas relacionados com um endereço (end_id)
 * @param {integer} end_id Id do endereço buscado
 * @return {Array} Retorna uma array com finalidades autorizadas para o endereço selecionado.
 */
router.get("/getDemandas", function (req, res) {
 //let { end_id } = req.query;

  //conexão com o banco
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
    }

    // criar requirisão
    var request = new sql.Request();

    let query = getOttoBasins();

    // requisição
    request.query(query, function (err, recordset) {
      if (err) console.log(err);

      console.log(recordset)

      let demandas = recordset.recordset.map((rec) => {
        if (rec.dt_demanda !== null) {
          // conversão xml to json
          xml2js.parseString(
            rec.dt_demanda,
            { explicitArray: false, normalizeTags: true, explicitRoot: false },
            (err, result) => {
              if (err) {
                throw err;
              }
              rec.dt_demanda = result;
            },
          );
        }
        return rec;
      });

      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.send(JSON.stringify(demandas));
    });
  });
});

module.exports = router;