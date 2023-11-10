const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const { body } = require('express-validator');
const validator=require('../middleware/ValidatorMiddleware')

router.post(
    '/generar-reserva',
   validator.validarReserva,
  reservaController.generarReserva,
  dbService.insertReserva
  );




module.exports = router;
