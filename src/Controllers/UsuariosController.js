const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool, connectDB } = require("../Config/db");

exports.createUser = async (req, res) => {
    try {
        const { nombre, correo, password, idmunicipio, direccion, telefonos, rol, urlfoto } = req.body;

        if (!nombre || !correo || !password || !idmunicipio || !rol) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        if (!req.token) {
            return res.status(403).json({ error: "Debes autenticarte antes de realizar esta petición" });
        }

        bcrypt.hash(password, 12, async (error, passwordHash) => {
            if (error) {
                console.error('Ocurrió un error al encriptar la clave del usuario', error);
                return res.status(500).json({ message: "Error interno del servidor" });
            }

            jwt.verify(req.token, "cacaoapp", async (authError, authData) => {
                if (authError) {
                    return res.status(403).json({ error: "Token inválido" });
                } else {
                    const [existingUser] = await pool.promise().query("SELECT * FROM usuarios WHERE correo = ?", [correo]);

                    if (existingUser.length > 0) {
                        return res.status(400).json({ message: "El correo ya se encuentra registrado" });
                    }

                    const [insertUser] = await pool.promise().query(
                        "INSERT INTO usuarios (nombre, correo, password, idmunicipio, direccion, telefonos, urlfoto, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [nombre, correo, passwordHash, idmunicipio, direccion, telefonos, urlfoto, rol, 'A']
                    );

                    if (insertUser.affectedRows) {
                        // Realizar acciones adicionales, como asignar permisos según el rol
                        // y devolver una respuesta exitosa
                        return res.status(200).json({ message: "Se ha creado correctamente el usuario" });
                    } else {
                        return res.status(500).json({ message: "No se ha podido crear el usuario" });
                    }
                }
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor", error });
    }
};
