const express = require("express");
const router = express.Router();
const UsuriosControllers = require("../Controllers/UsuariosController.js");
const Manicurista = require("../Controllers/Manicurista/ManicuristaControllers.js")
const verifyToken = require('../Middleware/verifyToken.js');
const AgendaCitas = require('../Controllers/agendamientoCitas/AgendarcitasControllers.js')

router.get("/", (req, res) => {
    res.json({
        mensaje: "Bienvenido a la api de Nails art"
    });
});
//ruta para el usuario 
router.post("/createusuario", UsuriosControllers.createUser);
router.post("/loginUsuario", UsuriosControllers.loginUser);


//Esta es la ruta para el crud de manicuristas 
router.post("/createManicurista", Manicurista.createManicurista);
router.get('/manicuristas', Manicurista.getManicurista);
router.put("/updateManicurista", Manicurista.updateManicurista);
router.delete("/eliminarManicurista/:idmanicurista", Manicurista.eliminarManicurista);
router.post('/loginManicurista', Manicurista.loginManicurista);

// estas son las rutas para agendar una cita
router.post("/crearTiposUñas", AgendaCitas.createTipoUñas)
router.get("/citas/:fecha", AgendaCitas.obtenerCitasPorFecha);

module.exports = router;
