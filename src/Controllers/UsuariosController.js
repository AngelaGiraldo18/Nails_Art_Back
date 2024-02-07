const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require("../Config/db");
 
// Cargar variables de entorno desde el archivo .env
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;

// Uso de Variables de Entorno
if (!secretKey) {
    console.error('La clave secreta no está configurada correctamente en el archivo .env.');
    process.exit(1); // Termina la aplicación con un código de error
}

exports.createUser = async (req, res) => {
    try {
        const { nombre, apellido, email, contrasena, rol } = req.body;
        console.log('FormData en el servidor:', req.body);

        if (!nombre || !apellido || !email || !contrasena || !rol) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        console.log('Petición recibida:', req.body);

        const passwordHash = await bcrypt.hash(contrasena, 12);

        const [existingUser] = await pool.promise().query("SELECT * FROM usuarios WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "El correo ya se encuentra registrado" });
        }
        connection.release();
        const [insertUser] = await pool.promise().query(
            "INSERT INTO usuarios (nombre, apellido, email, contraseña, rol) VALUES (?, ?, ?, ?, ?)",
            [nombre, apellido, email, passwordHash, rol]
        );

        connection.release();

        if (insertUser.affectedRows) {
            const usuarioId = insertUser.insertId; 
            const token = jwt.sign({ usuarioId }, secretKey, { expiresIn: '1h' });
            return res.status(200).json({ message: "Se ha creado correctamente el usuario", token });
        } else {
            return res.status(500).json({ message: "No se ha podido crear el usuario" });
        }
    } catch (error) {
        console.error('Error en el controlador:', error);
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

const insertAdmin = (callback) => {
    pool.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        const contraseña = '123456784';

        bcrypt.hash(contraseña, 12, (bcryptError, passwordHash) => {
            if (bcryptError) {
                console.error('Error al generar el hash de la contraseña:', bcryptError);
                releaseConnectionAndCallback(connection, bcryptError, callback);
                return;
            }

            connection.query("SELECT * FROM usuarios WHERE rol = 'admin'", (selectError, existingAdmin) => {
                if (selectError) {
                    console.error('Error al realizar la consulta para verificar el administrador existente:', selectError);
                    releaseConnectionAndCallback(connection, selectError, callback);
                    return;
                }

                if (existingAdmin.length === 0) {
                    connection.query(
                        "INSERT INTO usuarios (nombre, apellido, email, contraseña, rol) VALUES (?, ?, ?, ?, 'admin')",
                        ['juan', 'gonza', 'admin12@gmail.com', passwordHash],
                        (insertError, insertUser) => {
                            releaseConnectionAndCallback(connection, insertError, callback, insertUser);
                        }
                    );
                } else {
                    console.log('Ya existe un administrador en la base de datos. No se insertará uno nuevo.');
                    releaseConnectionAndCallback(connection, null, callback);
                }
            });
        });
    });
};

const releaseConnectionAndCallback = (connection, error, callback, result) => {
    connection.release();

    if (error) {
        console.error(error);
        callback(error);
    } else {
        console.log('Operación completada exitosamente.');
        callback(null, result);
    }
};

insertAdmin((error, result) => {
    if (error) {
        console.error('Error al ejecutar insertAdmin:', error);
    } else {
        // Manejar el resultado si es necesario
    }
});





exports.loginUser = async (req, res) => {
    try {
        const { email, contrasena } = req.body;
        console.log('Datos recibidos para iniciar sesión:', req.body);

        if (!email || !contrasena) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const [user] = await pool.promise().query("SELECT * FROM usuarios WHERE email = ?", [email]);
        connection.release();
        console.log('Resultado de la consulta a la base de datos:', user);

        if (user.length === 0) {
            return res.status(401).json({ message: "Correo o contraseña incorrectos" });
        }

        const passwordMatch = await bcrypt.compare(contrasena, user[0].contraseña);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Correo o contraseña incorrectos" });
        }

        const usuarioId = user[0].id;
        const token = jwt.sign({ usuarioId,rol: user[0].rol  }, secretKey, { expiresIn: '1h' });

        return res.status(200).json({
            message: "Inicio de sesión exitoso",
            token,
            usuario: {
                id: user[0].id,
                nombre: user[0].nombre,
                apellido: user[0].apellido,
                email: user[0].email,
                rol: user[0].rol
            }
        });
    } catch (error) {
        console.error('Error en el controlador de inicio de sesión:', error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

