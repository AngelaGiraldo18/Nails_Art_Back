const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const { connectDB } = require("./Config/db");
const routes = require('./Routes/Routes');
const dotenv = require('dotenv');

// Cargar las variables de entorno
dotenv.config();

app.use(cors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", routes);

// Después de tus rutas
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('¡Algo salió mal!');
});

connectDB();

module.exports = app;
