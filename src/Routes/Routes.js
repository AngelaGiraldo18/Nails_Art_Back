const express = require("express");
const router = express.Router();
const UsuriosControllers = require("../Controllers/UsuariosController.js");
const Manicurista = require("../Controllers/Manicurista/ManicuristaControllers.js")
const manicuristaController = require('../Controllers/Manicurista/ManicuristaControllers.js');

router.get("/", (req, res) => {
    res.json({
        mensaje: "Bienvenido a la api de Nails art"
    });
});
//ruta para el usuario 
router.post("/createusuario", UsuriosControllers.createUser);

//Esta es la ruta para el crud de manicuristas 
router.post("/createManicurista", Manicurista.createManicurista);
router.get('/getmanicuristas',manicuristaController.getManicuristas)


module.exports = router;
