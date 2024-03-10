const {pool} = require ('../../Config/db');

exports.obtenerCitasUsuario = async (req, res) => {
  const { userId } = req.params;
  try {
    const citas = await pool.query('SELECT * FROM citas WHERE id_usuario = ?', [userId]);
    res.json(citas);
  } catch (error) {
    console.error('Error al obtener citas del usuario:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

exports.obtenerServiciosRecientes = async (req, res) => {
  try {
    const servicios = await pool.query('SELECT * FROM servicio ORDER BY id_servicio DESC LIMIT 5');
    res.json(servicios);
  } catch (error) {
    console.error('Error al obtener servicios recientes:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

exports.obtenerServiciosConPreciosActualizados = async (req, res) => {
  try {
    const servicios = await pool.query('SELECT * FROM servicio WHERE updated_at > ?', [req.body.ultimaConsulta]);
    res.json(servicios);
  } catch (error) {
    console.error('Error al obtener servicios con precios actualizados:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};
