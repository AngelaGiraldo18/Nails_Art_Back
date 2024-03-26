const { pool } = require('../../Config/db');

exports.obtenerDetallesTransaccion = (req, res) => {
  const servicioId = req.params.id_servicio;
  const userId = req.params.id_usuario;

  // Función para generar dinámicamente el número de factura
  function generarNumeroFactura() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
    const dia = ('0' + fecha.getDate()).slice(-2);
    const numeroSecuencial = Math.floor(Math.random() * 10000); // Número aleatorio de 4 dígitos
    return `FAC-${año}${mes}${dia}-${numeroSecuencial}`;
  }

  // Consultar la base de datos para obtener los detalles del servicio con el ID proporcionado
  const servicioQuery = `SELECT tipo_servicio, precio FROM servicio WHERE id_servicio = ?`;

  pool.query(servicioQuery, [servicioId], (errorServicio, resultsServicio) => {
    if (errorServicio) {
      console.error('Error al obtener detalles del servicio:', errorServicio);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }

    if (resultsServicio.length > 0) {
      const servicio = resultsServicio[0];

      // Consultar la base de datos para obtener los detalles del usuario con el ID proporcionado
      const usuarioQuery = `SELECT nombre, apellido, email FROM usuarios WHERE id = ?`;

      pool.query(usuarioQuery, [userId], (errorUsuario, resultsUsuario) => {
        if (errorUsuario) {
          console.error('Error al obtener detalles del usuario:', errorUsuario);
          res.status(500).json({ error: 'Error interno del servidor' });
          return;
        }

        if (resultsUsuario.length > 0) {
          const usuario = resultsUsuario[0];
          // Generar el número de factura dinámicamente
          const factura = generarNumeroFactura();
          // Construir el objeto de datos para la transacción
          const data = {
            name: servicio.tipo_servicio,
            description: servicio.tipo_servicio,
            invoice: factura,
            amount: servicio.precio,
            country: "co",
            lang: "es",
            currency: "cop",
            tax_base: (parseFloat(servicio.precio) * 0.8).toFixed(2),
            tax: (parseFloat(servicio.precio) * 0.1).toFixed(2),
            external: "true",
            name_billing: usuario.nombre + ' ' + usuario.apellido, 
            address_billing: "Dirección del usuario",
            type_doc_billing: "cc",
            mobilephone_billing: "",
            number_doc_billing: "",
          };
          res.json(data);
          /*res.redirect('https://nailsartapp.netlify.app/');*/
        } else {
          res.status(404).json({ error: 'Usuario no encontrado' });
        }
      });
    } else {
      res.status(404).json({ error: 'Servicio no encontrado' });
    }
  });
};
