const express = require("express");
const verifyToken = require("../Middleware/verifyToken");
const UsuriosControllers = require("../Controllers/UsuariosController.js");

const jwt = require("jsonwebtoken");
const path = require('path');
const {verify} = require("jsonwebtoken");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        mensaje: "Bienvenido a la api de cacaoApp"
    });
});

router.post("/createusuario", verifyToken, UsuriosControllers.createUser);
