const bcrypt = require('bcrypt');
const { pool } = require("../Config/db");

exports.createUser = async (req, res) => {
    try {
        const { nombre, apellido, email, contraseña, rol } = req.body;

        // Validación de datos de entrada
        if (!nombre || !apellido || !email || !contraseña || !rol) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        if (contraseña.length < 8) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" });
        }

        // Hashear la contraseña
        const passwordHash = await bcrypt.hash(contraseña, 12);

        // Verificar si el correo ya está registrado
        const [existingUser] = await pool.promise().query("SELECT * FROM usuarios WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "El correo ya se encuentra registrado" });
        }

        // Inserción del nuevo usuario
        const [insertUser] = await pool.promise().query(
            "INSERT INTO usuarios (nombre, apellido, email, contraseña, rol) VALUES (?, ?, ?, ?, ?)",
            [nombre, apellido, email, passwordHash, rol]
        );

        if (insertUser.affectedRows) {
            // Realizar acciones adicionales, como asignar permisos según el rol

            // Devolver una respuesta exitosa
            return res.status(200).json({ message: "Se ha creado correctamente el usuario" });
        } else {
            return res.status(500).json({ message: "No se ha podido crear el usuario" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};
