const express = require("express");
const router = express.Router();
const UsuriosControllers = require("../Controllers/UsuariosController.js");
const Manicurista = require("../Controllers/Manicurista/ManicuristaControllers.js");
const verifyToken = require('../Middleware/verifyToken.js');
const AgendaCitas = require('../Controllers/agendamientoCitas/AgendarcitasControllers.js');
const empleadosController = require('../Controllers/TrabajaConNosotros/TrabajaNosotrosControllers.js');

router.get("/", (req, res) => {
    res.json({
        mensaje: "Bienvenido a la api de Nails art"
    });
});

// Rutas para el usuario
router.post("/createusuario", UsuriosControllers.createUser);
router.post("/loginUsuario", UsuriosControllers.loginUser);

// Rutas para el CRUD de manicuristas
router.post("/createManicurista", Manicurista.createManicurista);
router.get('/manicuristas', Manicurista.getManicurista);
router.put("/updateManicurista", Manicurista.updateManicurista);
router.delete("/eliminarManicurista/:idmanicurista", Manicurista.eliminarManicurista);
router.post('/loginManicurista', Manicurista.loginManicurista);

// Rutas para agendar una cita
router.post("/crearCita", AgendaCitas.createCita);
router.get("/citas/:fecha", AgendaCitas.obtenerCitasPorFecha);

// Rutas para el Trabajador Candidato
router.post('/createEmpleadoCandidato', empleadosController.upload.single('hojaVidaFile'), empleadosController.createEmpleadoCandidato);
router.get('/getAllEmpleadosCandidatos/:email', empleadosController.getAllEmpleadosCandidatos);
router.post('/sendEmailWithEmpleadosData', empleadosController.sendEmailWithEmpleadosData);

module.exports = router;
