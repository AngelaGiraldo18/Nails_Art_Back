

const { body } = require('express-validator');

const validarReserva = [
  body('nombre').notEmpty(),
  body('fecha1').notEmpty().isDate(),
  body('hora').notEmpty().isString(),
  body('servicio').notEmpty().isString(),
];

module.exports = {
  validarReserva,
};
