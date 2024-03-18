const express = require("express");
const router = express.Router();

const bodyParser = require('body-parser');
const {API_KEY_GEMINI, START_CHAT, GENERATION_CONFIG} = require('../Config/config.js')

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(API_KEY_GEMINI);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const UsuriosControllers = require("../Controllers/UsuariosController.js");
const Manicurista = require("../Controllers/Manicurista/ManicuristaControllers.js");
const verifyToken = require('../Middleware/verifyToken.js');
const AgendaCitas = require('../Controllers/agendamientoCitas/AgendarcitasControllers.js');
const empleadosController = require('../Controllers/TrabajaConNosotros/TrabajaNosotrosControllers.js');
const favoritasController = require('../Controllers/favoritas/favoritas.js');
const EstadoDeCitaController = require('../Controllers/estadoCitaModal/estadoCitaModal.js')
const ConfiguracionController = require('../Controllers/configuracion/configuracion.js')
const HistorialController = require('../Controllers/historial/historial.js')
const Notificaciones = require('../Controllers/notificaciones/notificaciones.js');
const PasarelaControllers =  require('../Controllers/pasarela/pasarela.js');
const multer = require('multer'); // Asegúrate de importar multer

router.get("/", (req, res) => {
    res.json({
        mensaje: "Bienvenido a la api de Nails art"
    });
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/img') // Directorio donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname) // Nombre de archivo único
  }
});

const upload = multer({ storage: storage });
// Rutas para el usuario
router.post("/createusuario", UsuriosControllers.createUser);
router.post("/loginUsuario", UsuriosControllers.loginUser);
router.post('/usuarios/:id/imagen', upload.single('imagen'), UsuriosControllers.actualizarImagenUsuario);


// Rutas para el CRUD de manicuristas 
router.post("/createManicurista", Manicurista.upload.single('imagen'), Manicurista.createManicurista);
router.get('/manicuristas', Manicurista.getManicurista);
router.put("/updateManicurista", Manicurista.upload.single('imagen'),Manicurista.updateManicurista);
router.delete("/eliminarManicurista/:idmanicurista", Manicurista.eliminarManicurista);
router.post('/loginManicurista', Manicurista.loginManicurista);
router.get('/buscar-por-nombre/:nombre', Manicurista.buscarPorNombre);

// Rutas para agendar una cita
router.post("/crearCita", AgendaCitas.createCita);
router.get("/citas/:fecha/:id_usuario/:rol", AgendaCitas.obtenerCitasPorFecha);
router.get('/manicuristas/:idManicurista/citas', AgendaCitas.obtenerCitasPorManicurista);

// Rutas para el Trabajador Candidato
router.post('/createEmpleadoCandidato', empleadosController.upload.single('hojaVidaFile'), empleadosController.createEmpleadoCandidato);
router.get('/getAllEmpleadosCandidatos/:email', empleadosController.getAllEmpleadosCandidatos);
router.post('/sendEmailWithEmpleadosData', empleadosController.sendEmailWithEmpleadosData);

//Rutas de favoritos
router.get('/manicurista/favorita/:email', favoritasController.getFavoritaManicurista);


//Rutas de Cambio de estado
router.put('/cambioDeEstado', EstadoDeCitaController.cambioEstado);
router.get('/citas/:id_cita', EstadoDeCitaController.obtenerCita);
router.get('/citasUsuario', EstadoDeCitaController.obtenerCitasUsuario);
router.delete('/eliminarCita/:id_cita', EstadoDeCitaController.eliminarCita);

//Rutas de configuracion 
router.get('/Configuracion', ConfiguracionController.getServicios);
router.post('/CrearServicio', ConfiguracionController.insertarServicio);
router.put('/ActualizarPrecio/:id_servicio', ConfiguracionController.actualizarPrecioServicio);
router.delete('/eliminarServicio/:id_servicio', ConfiguracionController.eliminarServicio);

//Rutas de Historial
router.get('/historial/:usuarioId', HistorialController.obtenerFechasCitasUsuario);


//Pasarela
router.get('/detalles/:id_servicio/:id_usuario', PasarelaControllers.obtenerDetallesTransaccion);


//NOtificaciones
router.get('/citas/:userId', Notificaciones.obtenerCitasUsuario);
router.get('/servicios/recientes', Notificaciones.obtenerServiciosRecientes);
router.post('/servicios/precios-actualizados', Notificaciones.obtenerServiciosConPreciosActualizados);

//chat

router.post('/chat', async (req, res) => {
    let history = req.body.history;
    let question = req.body.question;
    let historyChat = START_CHAT.concat(history)
    const chat = model.startChat({
      history: historyChat,
      generationConfig: GENERATION_CONFIG
    });
    const sendQuestion = await chat.sendMessage(question);
    const response = await sendQuestion.response;
    const text = response.text();
    history.push({role: "user", parts: question})
    history.push({role: "model", parts: text})
    return res.status(200).json({history: history});
  })

module.exports = router;