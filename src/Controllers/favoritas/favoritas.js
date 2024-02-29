// Controlador en el servidor (favoritas.js)
const { pool } = require("../../Config/db");

exports.getFavoritaManicurista = async (req, res) => {
  try {
    const userEmail = req.params.email;
    // Consulta SQL para obtener la manicurista favorita
    const query = `
    SELECT m.nombre AS nombre_manicurista, m.fotoManicurista, m.descripcion
    FROM manicurista m
    JOIN citas c ON m.id_manicurista = c.id_manicurista
    JOIN usuarios u ON c.id_usuario = u.id
    WHERE u.email = 'admin12@gmail.com'
    GROUP BY m.id_manicurista
    ORDER BY COUNT(c.id_cita) DESC;
    `;

    // Ejecutar la consulta
    const [result] = await pool.promise().query(query, [userEmail]); // Nota: La variable userEmail ya es un array, no necesitas envolverla nuevamente.

    console.log('Resultado de la consulta SQL:', result); // Agrega este log

    if (result.length > 0) {
      res.status(200).json(result);  // Modificación en esta línea
    } else {
      res.status(404).json({ message: 'Manicurista favorita no encontrada para el usuario.' });
    }
  } catch (error) {
    console.error('Error al obtener la manicurista favorita:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
