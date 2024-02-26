const { pool } = require("../../Config/db");
const jwt = require('jsonwebtoken');

exports.createCita = async (req, res) => {
  try {
    console.log('Datos de la cita:', req.body);

    const { id_usuario, id_manicurista, tipo_servicio, ubicacion_servicio, fecha_del_servicio, estado } = req.body;
    if (!id_usuario || !id_manicurista || !tipo_servicio || !ubicacion_servicio || !fecha_del_servicio || !estado) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
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
    const id_usuario = req.params.id_usuario; 

    // Luego, utilizamos el ID del manicurista para obtener las citas
    const resultCitas = await pool.promise().query(`
      SELECT
        c.id_cita,
        u.nombre as usuario_nombre,
        m.nombre as manicurista_nombre,
        c.tipo_servicio,
        c.ubicacion_servicio,
        c.duracion_en_horas,
        c.fecha_del_servicio,
        c.estado
      FROM 
        citas c
      JOIN 
        usuarios u ON c.id_usuario = u.id_usuario
      JOIN 
        manicurista m ON c.id_manicurista = m.id_manicurista
      WHERE 
       ( DATE(c.fecha_del_servicio) = ? AND m.id_manicurista = ?)  OR   (DATE(c.fecha_del_servicio) = ? AND ? = 1);
    `, [fecha, id_usuario, fecha, id_usuario]);

    // Convertir la hora militar a hora en formato de 12 horas (AM/PM)
    resultCitas[0].forEach(cita => {
      const horaMilitar = cita.fecha_del_servicio.getHours(); // Obtener la hora en formato militar (0-23)
      let hora12h = horaMilitar % 12 || 12; // Convertir a formato de 12 horas
      const minutos = cita.fecha_del_servicio.getMinutes();
      const ampm = horaMilitar < 12 ? 'AM' : 'PM';
      cita.hora_del_servicio = `${hora12h}:${minutos < 10 ? '0' : ''}${minutos} ${ampm}`; // Agregar al resultado
    });

    console.log('Fecha después de la consulta:', fecha,"idma",id_usuario);

    // Devuelve las citas encontradas como respuesta
    res.status(200).json(resultCitas[0]);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
};
