const express = require('express');
const app = express();
const cors = require('cors');
const { connectDB } = require("./src/Config/db");


app.use(cors());
app.use(express.json);
connectDB();

module.exports = app;