const { pool } = require('../../Config/db');

exports.obtenerFechasCitasUsuario = async (req, res) => {
    try {
        const { usuarioId } = req.params;

        if (!usuarioId) {
            return res.status(400).json({ message: 'Falta el ID de usuario' });
        }

        const [citas] = await pool.promise().query("SELECT * FROM citas WHERE id_usuario = ?", [usuarioId]);

        if (citas.length === 0) {
            return res.status(404).json({ message: "El usuario no tiene citas programadas" });
        }

        return res.status(200).json(citas); // Devuelve directamente el arreglo de citas
    } catch (error) {
        console.error('Error en el controlador de obtención de fechas de citas de usuario:', error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};