
const { validationResult } = require('express-validator');

const generarReserva = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  res.send('Reserva generada!');
};

module.exports = {
  generarReserva,
};
