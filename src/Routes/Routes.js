const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/verifyToken.js");
const UsuriosControllers = require("../Controllers/UsuariosController.js");

router.get("/", (req, res) => {
    res.json({
        mensaje: "Bienvenido a la api de Nails art"
    });
});

router.post("/createusuario", UsuriosControllers.createUser);

module.exports = router;
