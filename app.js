const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

class App {
    constructor() {
        this.express = express();
        
        this.database();
        this.middlewares();
        this.routes();

        this.express.listen(2202, () =>
            console.log(`API REST con PostgreSQL ejecutando en el puerto 2202`)
        );
    }

    async database() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_DATABASE,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT
        });
    }

    middlewares() {
        this.express.use(express.json());
    }

    routes() {
        this.express.use(require("./src/routes/directorioRoutes"));
    }
}

module.exports = new App().express;