const express = require("express");
const directorioController = require("../controller/directorioController");
const routes = express.Router();

routes.get('/status/', directorioController.getStatus);
routes.get('/directories/', directorioController.findAll);
routes.post('/directories/', directorioController.create);
routes.get('/directories/:id', directorioController.findOne);
routes.put('/directories/:id', directorioController.update);
routes.patch('/directories/:id', directorioController.updatePartial);
routes.delete('/directories/:id', directorioController.delete);

module.exports = routes;