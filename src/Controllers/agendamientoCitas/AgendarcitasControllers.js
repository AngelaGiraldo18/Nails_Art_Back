const { pool } = require("../../Config/db");
const jwt = require('jsonwebtoken');

exports.createCita = async (req, res) => {
  try {
    console.log('Datos de la cita:', req.body);

    const { id_usuario, id_manicurista, tipo_servicio, ubicacion_servicio, fecha_del_servicio, estado } = req.body;
    if (!id_usuario || !id_manicurista || !tipo_servicio || !ubicacion_servicio || !fecha_del_servicio || !estado) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Verificar si ya existe una cita para la misma fecha, hora y manicurista
    const existingCita = await pool.promise().query(
      "SELECT fecha_del_servicio, duracion_en_horas FROM citas WHERE id_manicurista = ? AND fecha_del_servicio = ?",
      [id_manicurista, fecha_del_servicio]
    );

    if (existingCita[0].length > 0) {
      // Calcular la hora de finalización de la cita existente
      const horaInicioCitaExistente = new Date(existingCita[0].fecha_del_servicio);
      const horaFinCitaExistente = new Date(horaInicioCitaExistente.getTime() + existingCita[0].duracion_en_horas * 60 * 60 * 1000);

      // Calcular la hora de finalización de la nueva cita
      const horaInicioNuevaCita = new Date(fecha_del_servicio);
      const horaFinNuevaCita = new Date(horaInicioNuevaCita.getTime() + duracion_en_horas * 60 * 60 * 1000);

      // Verificar si hay superposición de citas
      if (!(horaInicioNuevaCita >= horaFinCitaExistente || horaFinNuevaCita <= horaInicioCitaExistente)) {
        return res.status(400).json({ message: "El manicurista no está disponible en el horario seleccionado" });
      }
    }

    let duracion_en_horas = 0;
    const [insertCita] = await pool.promise().query(
      "INSERT INTO citas (id_usuario, id_manicurista, tipo_servicio, ubicacion_servicio, duracion_en_horas, fecha_del_servicio, estado) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id_usuario, id_manicurista, tipo_servicio, ubicacion_servicio, duracion_en_horas, fecha_del_servicio, estado]
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
    c.fecha_del_servicio,
    c.estado
    FROM citas c
    JOIN usuarios u ON c.id_usuario = u.id
    JOIN manicurista m ON c.id_manicurista = m.id_manicurista
    WHERE DATE(c.fecha_del_servicio) = ?;
    `, [fecha]);

    // Convertir la hora militar a hora en formato de 12 horas (AM/PM)
    result[0].forEach(cita => {
      const horaMilitar = cita.fecha_del_servicio.getHours(); // Obtener la hora en formato militar (0-23)
      let hora12h = horaMilitar % 12 || 12; // Convertir a formato de 12 horas
      const minutos = cita.fecha_del_servicio.getMinutes();
      const ampm = horaMilitar < 12 ? 'AM' : 'PM';
      cita.hora_del_servicio = `${hora12h}:${minutos < 10 ? '0' : ''}${minutos} ${ampm}`; // Agregar al resultado
    });

    console.log('Fecha después de la consulta:', fecha);

    // Devuelve las citas encontradas como respuesta
    res.status(200).json(result[0]);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
};

exports.obtenerCitasPorFechaYManicurista = async (req, res) => {
  try {
    const idManicurista = req.params.idManicurista;
    const fecha = req.params.fecha;
    const result = await pool.promise().query(`
      SELECT
        c.id_cita,
        u.nombre as usuario_nombre,
        m.nombre as manicurista_nombre,
        c.tipo_servicio,
        c.ubicacion_servicio,
        c.duracion_en_horas,
        c.fecha_del_servicio,
        c.estado
      FROM citas c
      JOIN usuarios u ON c.id_usuario = u.id
      JOIN manicurista m ON c.id_manicurista = m.id_manicurista
      WHERE c.fecha_del_servicio = ? AND c.id_manicurista = ?;
    `, [fecha, idManicurista]);

    // Resto del código para el formateo de las citas y la respuesta del servidor...

  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error al obtener citas' }); // Proporciona un mensaje de error más descriptivo si es posible
  }
};