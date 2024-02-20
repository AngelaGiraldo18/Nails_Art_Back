const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require("../Config/db");
 

require('dotenv').config();
const secretKey = process.env.SECRET_KEY;


if (!secretKey) {
    console.error('La clave secreta no está configurada correctamente en el archivo .env.');
    process.exit(1); 
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

      
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error al obtener una conexión:', err);
                return res.status(500).json({ message: "Error interno del servidor" });
            }

            connection.query("SELECT * FROM usuarios WHERE email = ?", [email], async (queryError, existingUser) => {
                if (queryError) {
                    console.error('Error al realizar la consulta de usuario existente:', queryError);
                    connection.release();
                    return res.status(500).json({ message: "Error interno del servidor" });
                }

                if (existingUser.length > 0) {
                    connection.release();
                    return res.status(400).json({ message: "El correo ya se encuentra registrado" });
                }

                connection.query(
                    "INSERT INTO usuarios (nombre, apellido, email, contraseña, rol) VALUES (?, ?, ?, ?, ?)",
                    [nombre, apellido, email, passwordHash, rol],
                    (insertError, insertUser) => {
                        connection.release();
                        if (insertError) {
                            console.error('Error al insertar usuario:', insertError);
                            return res.status(500).json({ message: "Error interno del servidor" });
                        }

                        if (insertUser.affectedRows) {
                            const usuarioId = insertUser.insertId;
                            const token = jwt.sign({ usuarioId }, secretKey, { expiresIn: '1h' });
                            return res.status(200).json({ message: "Se ha creado correctamente el usuario", token });
                        } else {
                            return res.status(500).json({ message: "No se ha podido crear el usuario" });
                        }
                    }
                );
            });
        });
    } catch (error) {
        console.error('Error en el controlador:', error);
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

        
            
            connection.query("SELECT * FROM usuarios WHERE email = 'nailsartadmin@gmail.com'", (selectError, existingAdmin) => {
                if (selectError) {
                    console.error('Error al realizar la consulta para verificar el administrador existente:', selectError);
                    releaseConnectionAndCallback(connection, selectError, callback);
                    return;
                }

           


                if (existingAdmin.length === 0) {
                    connection.query(
                        "INSERT INTO usuarios (nombre, apellido, email, contraseña, rol) VALUES (?, ?, ?, ?, 'admin')",
                        ['juan', 'cardona', 'nailsartadmin@gmail.com', passwordHash],
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
        
    }
});





exports.loginUser = async (req, res) => {
    try {
        const { email, contrasena } = req.body;
        console.log('Datos recibidos para iniciar sesión:', req.body);

        if (!email || !contrasena) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

      
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error al obtener una conexión:', err);
                return res.status(500).json({ message: "Error interno del servidor" });
            }

            connection.query("SELECT * FROM usuarios WHERE email = ?", [email], async (queryError, user) => {
                if (queryError) {
                    console.error('Error al realizar la consulta a la base de datos:', queryError);
                    connection.release();
                    return res.status(500).json({ message: "Error interno del servidor" });
                }

                if (user.length === 0) {
                    connection.release();
                    return res.status(401).json({ message: "Correo o contraseña incorrectos" });
                }

                const passwordMatch = await bcrypt.compare(contrasena, user[0].contraseña);

                if (!passwordMatch) {
                    connection.release();
                    return res.status(401).json({ message: "Correo o contraseña incorrectos" });
                }

                const usuarioId = user[0].id;
                const token = jwt.sign({ usuarioId, rol: user[0].rol }, secretKey, { expiresIn: '1h' });

                connection.release(); 

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
            });
        });
    } catch (error) {
        console.error('Error en el controlador de inicio de sesión:', error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};