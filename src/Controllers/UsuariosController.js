const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require("../Config/db");

exports.createUser = async (req, res) => {
    try {
        console.log('Datos del usuario a insertar:', req.body);

        const { nombre, apellido, email, contrasena, rol } = req.body;

        if (!nombre || !apellido || !email || !contrasena || !rol) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }
        console.log('Petición recibida:', req.body);

        if (contrasena.length <= 8) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" });
        }

        const passwordHash = await bcrypt.hash(contrasena, 12);

        const [existingUser] = await pool.promise().query("SELECT * FROM usuarios WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "El correo ya se encuentra registrado" });
        }

        const [insertUser] = await pool.promise().query(
            "INSERT INTO usuarios (nombre, apellido, email, contraseña, rol) VALUES (?, ?, ?, ?, ?)",
            [nombre, apellido, email, passwordHash, rol]
        );

        if (insertUser.affectedRows) {
            const usuarioId = insertUser.insertId; 
            // Comentamos la línea que utiliza process.env.SECRET_KEY y proporcionamos un token estático para prueba
            // const token = jwt.sign({ usuarioId }, process.env.SECRET_KEY, { expiresIn: '1h' });
            const staticToken = 'token_estatico_de_prueba'; // Reemplaza con el token que desees
            return res.status(200).json({ message: "Se ha creado correctamente el usuario", token: staticToken });
        } else {
            return res.status(500).json({ message: "No se ha podido crear el usuario" });
        }
    } catch (error) {
        console.error('Error en el controlador:', error);
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};
