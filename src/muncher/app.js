const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

class App {
  constructor() {
    this.routePrv = new routes.Routes();
    this.app = express();
    this.config();
    this.routePrv.routes(this.app);
  }
  config() {
    this.app.use(bodyParser.json());
    this.app.use(function(req, res, next) {
    next();
    });
    this.app.get('/test', (req, res, next) => {
	console.log(req);
	res.send(200);
	next();
    })
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
      next();
    });
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }
}
exports.default = new App().app;
