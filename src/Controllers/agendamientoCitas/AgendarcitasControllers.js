// Importa el pool desde tu archivo de configuración
const { pool } = require("../../Config/db");
const jwt = require('jsonwebtoken');

exports.createTipoUñas = async (req, res) => {
  try {
    console.log('datos obtenidos', req.body);
    const { nombre, duracion_en_mano_hora, duracion_en_pie_hora, descripcion } = req.body;
    if (!nombre || !duracion_en_mano_hora || !duracion_en_pie_hora || !descripcion) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    console.log('Petición recibida:', req.body);

    const [insertTipoUñas] = await pool.promise().query(
      "INSERT INTO tipos_de_uñas (nombre, duracion_en_mano_hora, duracion_en_pie_hora, descripcion) VALUES (?, ?, ?, ?)",
      [nombre, duracion_en_mano_hora, duracion_en_pie_hora, descripcion]
    );

    if (insertTipoUñas.affectedRows) {
      const tipoUñasId = insertTipoUñas.insertId;
      // Puedes devolver el ID del tipo de uñas creado o cualquier otra información
      return res.status(200).json({ message: "Se ha creado correctamente el tipo de uñas", tipoUñasId });
    } else {
      return res.status(500).json({ message: "No se ha podido crear el tipo de uñas" });
    }
  } catch (error) {
    console.error('Error en el controlador:', error);
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
}

// Importa el pool desde tu archivo de configuración
exports.obtenerCitasPorFecha = async (req, res) => {
    try {
      const fecha = req.params.fecha;
      console.log('Fecha antes de la consulta:', fecha);

      // Realiza la consulta a la base de datos para obtener citas en la fecha especificada
      const result = await pool.promise().query(`
      SELECT
      c.id_cita,
      u.nombre as usuario_nombre,
      m.nombre as manicurista_nombre,
      s.nombre as servicio_nombre,
      c.fecha_hora_inicio,
      c.fecha_hora_fin,
      c.estado
    FROM citas c
    JOIN usuarios u ON c.id_usuario = u.id
    JOIN manicurista m ON c.id_manicurista = m.idmanicurista
    JOIN servicios s ON c.id_servicio = s.id_servicio
    WHERE DATE(c.fecha_hora_inicio) = ?;
      `, [fecha]);
      console.log('Fecha después de la consulta:', fecha);

  
      // Devuelve las citas encontradas como respuesta
      res.status(200).json(result[0]);
    } catch (error) {
      console.error('Error al obtener citas:', error);
      res.status(500).json({ error: 'Error al obtener citas' });
    }
  };
  
