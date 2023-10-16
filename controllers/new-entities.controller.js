'use strict'

const fs = require('fs');
const path = require('path');

const moment = require('moment');
const mongoConfig = require('../services/mongodb.service');

const COLLECTION_NAME = "_global_cat_entities";


// Función para cargar entidades del archivo
function cargarEntidades() {
  // const rawData = fs.readFileSync(path.join(__dirname, 'jsons/_global_entities.json'));
  // return JSON.parse(rawData).entidades;
  return [];
}

// Función para guardar entidades en el archivo
function guardarEntidades(entidades) {
  // fs.writeFileSync(path.join(__dirname, 'jsons/_global_entities.json'), JSON.stringify({ entidades }));
  return {};
}

function obtenerEntidades(req, res) {
  // const entidades = cargarEntidades();
  // res.status(200).json({ code: "OK", object: entidades, message: "" });

  mongoConfig.connectToServer( function( connectionError, client ) {
        if (connectionError) {
            res.status(500).send({code: "KO", object: null, error: connectionError });
        } else {
            var db = mongoConfig.getDb();
            db.collection(COLLECTION_NAME).find({}).toArray(async function(err, configArray) {
                if (err) {
                    console.error("error in getConfiguration, ", err);
                    client.close();
                    res.status(500).send({code: "KO", object: null, error: err });
                } else {
                    client.close();
                    res.status(200).send({code: "OK", object: configArray });
                }
            });
        }
    });

}

function saveEntities(req, res) {
  // const entidades = cargarEntidades();
  // const entidadExistente = entidades.find(entity =>
  //   (entity._id && entity._id.toLowerCase() === req.body._id.toLowerCase()) ||
  //   (entity.companyName && entity.companyName.toLowerCase() === req.body.companyName.toLowerCase())
  // );

  // if (entidadExistente) {
  //   return res.status(409).json({ code: "DUPLICATE", message: "La entidad con ese identificador o nombre de compañía ya existe." });
  // }

  // req.body.isEnabled = (req.body.isEnabled === 'true' || req.body.isEnabled === true);
  // entidades.push(req.body);
  // guardarEntidades(entidades);

  // res.status(200).json({ code: "OK", object: entidades, message: "Entidad agregada con éxito." });

  const params = req.body;

    mongoConfig.connectToServer( function( connectionError, client ) {
        if (connectionError) {
            res.status(500).send({code: "KO", object: null, error: connectionError });
        } else {
            var db = mongoConfig.getDb();
            db.collection(COLLECTION_NAME).insertOne(params,  function(err, result) {
                if (err) {
                    console.error("error in createConfiguration, ", err);
                    client.close();
                    res.status(500).send({code: "KO", object: null, error: err });
                } else {
                    client.close();
                    res.status(200).send({code: "OK", object: result });
                }
            });
        }
    });
}

function editEntities(req, res) {
  const entidades = cargarEntidades();
  const matchedEntityIndex = entidades.findIndex(entity => entity._id === req.body._id);

  if (matchedEntityIndex === -1) {
    return res.status(404).json({ code: "NOT_FOUND", message: "La entidad no existe." });
  }

  if (typeof req.body.isEnabled === 'string') {
    req.body.isEnabled = req.body.isEnabled.toLowerCase() === "true";
  }

  entidades[matchedEntityIndex] = req.body;
  guardarEntidades(entidades);

  res.status(200).json({ code: "OK", object: entidades, message: "Entidad editada con éxito." });
}

function deleteEntity(req, res) {
  const entidades = cargarEntidades();
  const matchedEntityIndex = entidades.findIndex(entity => entity._id === req.body._id);

  if (matchedEntityIndex === -1) {
    return res.status(404).json({ code: "NOT_FOUND", message: "La entidad no existe." });
  }

  entidades.splice(matchedEntityIndex, 1);
  guardarEntidades(entidades);

  res.status(200).json({ code: "OK", object: entidades, message: "Entidad eliminada con éxito." });
}

module.exports = {
  obtenerEntidades,
  saveEntities,
  deleteEntity,
  editEntities,
  cargarEntidades
};
