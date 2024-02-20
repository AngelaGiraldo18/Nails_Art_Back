const { pool } = require("../../Config/db");

exports.getServicios = async (req, res) => {
    try {
        const [servicios] = await pool.promise().query("SELECT * FROM servicio");
        if (servicios.length === 0) {
            return res.status(404).json({ message: "No se encontraron servicios" });
        }
        return res.status(200).json({ servicios });

    } catch (error) {
        console.error('Error en el controlador de obtención de servicios:', error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

exports.insertarServicio = async (req, res) => {
    try {
        const { tipo_servicio, precio } = req.body;

        if (!tipo_servicio || !precio) {
            return res.status(400).json({ message: "Se requieren tipo de servicio y precio" });
        }

        const query = "INSERT INTO servicio (tipo_servicio, precio) VALUES (?, ?)";
        const result = await pool.promise().query(query, [tipo_servicio, precio]);

        return res.status(201).json({ message: "Servicio insertado correctamente", servicioId: result.insertId });
    } catch (error) {
        console.error('Error al insertar servicio:', error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

exports.actualizarPrecioServicio = async (req, res) => {
    try {
        const { id_servicio } = req.params; 
        const { precio } = req.body;

        if (!precio) {
            return res.status(400).json({ message: "Se requiere el nuevo precio" });
        }

        const query = "UPDATE servicio SET precio = ? WHERE id_servicio = ?";
        const result = await pool.promise().query(query, [precio, id_servicio]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "El servicio no fue encontrado" });
        }

        return res.status(200).json({ message: "Precio del servicio actualizado correctamente" });
    } catch (error) {
        console.error('Error al actualizar el precio del servicio:', error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};