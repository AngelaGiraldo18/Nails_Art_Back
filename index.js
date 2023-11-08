const express = require('express');
const app = express();
const cors = require('cors');
const { connectDB } = require("./src/Config/db");
const routes = require('./src/Routes/Routes')

app.use(cors());
app.use(express.json);
app.use("/api", routes);
connectDB();


module.exports = app;