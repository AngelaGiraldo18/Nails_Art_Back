// Importa el pool desde tu archivo de configuración
const { pool } = require("../../Config/db");
const jwt = require('jsonwebtoken');

exports.createCita = async (req, res) => {
  try {
    console.log('Datos de la cita:', req.body);

    const { id_usuario, id_manicurista, tipo_servicio, ubicacion_servicio, favorito, fecha_del_servicio, estado } = req.body;
    const fechaServicio = new Date(fecha_del_servicio);      
    if (!id_usuario || !id_manicurista || !tipo_servicio || !ubicacion_servicio || favorito === undefined || !fecha_del_servicio || !estado) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    console.log('Valor de favorito:', favorito);
    console.log('Datos de la cita:', req.body);

    // Calculamos la duración en función del tipo de servicio y ubicación
    let duracion_en_horas = 0; // Aquí se calculará la duración según la lógica de tu aplicación
    console.log('Datos de la cita recibidos en el servidor:', req.body);
    console.log('Valor de favorito recibido en el servidor:', req.body.favorito);

    const [insertCita] = await pool.promise().query(
      "INSERT INTO citas (id_usuario, id_manicurista, tipo_servicio, ubicacion_servicio, duracion_en_horas, favorito, fecha_del_servicio, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id_usuario, id_manicurista, tipo_servicio, ubicacion_servicio, duracion_en_horas, favorito, fechaServicio, estado]
    );

    if (insertCita.affectedRows) {
      return res.status(200).json({ message: "Se ha creado correctamente la cita" });
    } else {
      return res.status(500).json({ message: "No se ha podido crear la cita" });
    }
  } catch (error) {
    console.error('Error en el controlador de creación de cita:', error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

exports.obtenerCitasPorFecha = async (req, res) => {
    try {
      const fecha = req.params.fecha;
      console.log('Fecha antes de la consulta:', fecha);
        const result = await pool.promise().query(`
        SELECT
          c.id_cita,
          u.nombre as usuario_nombre,
          m.nombre as manicurista_nombre,
          c.tipo_servicio,
          c.ubicacion_servicio,
          c.duracion_en_horas,
          c.favorito,
          c.fecha_del_servicio,
          c.estado
        FROM citas c
        JOIN usuarios u ON c.id_usuario = u.id
        JOIN manicurista m ON c.id_manicurista = m.idmanicurista
        WHERE DATE(c.fecha_del_servicio) = ?;
      `, [fecha]);
  
      console.log('Fecha después de la consulta:', fecha);
  
      // Devuelve las citas encontradas como respuesta
      res.status(200).json(result[0]);
    } catch (error) {
      console.error('Error al obtener citas:', error);
      res.status(500).json({ error: 'Error al obtener citas' });
    }
  };