const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require("../Config/db");
const multer = require('multer');

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const { API_KEY_GEMINI } = require('../Config/config');
const genAI = new GoogleGenerativeAI(API_KEY_GEMINI);


// Cargar variables de entorno desde el archivo .env
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;

function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType
      },
    };
}


// Configurar multer para gestionar la carga de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/img') // Directorio donde se guardarán las imágenes
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname) // Nombre de archivo único
    }
});
const upload = multer({ storage: storage });

function getDefaultImageURL() {
    return "http://localhost:4000/uploads/img/users.png";
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

        let fileUrl = getDefaultImageURL(); // Obtiene la URL de la imagen por defecto

        // Verifica si se ha subido una imagen
        if (req.file) {
            fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path}`; // URL de la imagen subida
        }

        const [insertUser] = await pool.promise().query(
            "INSERT INTO usuarios (nombre, apellido, email, contraseña, fotoUsuario, rol) VALUES (?, ?, ?, ?, ?, ?)",
            [nombre, apellido, email, passwordHash, fileUrl, rol]
        );

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


    async function insertarAdmin() {
        try {
        const contraseña = '123456784'; 
    
        
        const passwordHash = await bcrypt.hash(contraseña, 12);

    
        const [existingAdmin] = await pool.promise().query("SELECT * FROM usuarios WHERE rol = 'admin'");

        if (existingAdmin.length === 0) {
            const [insertUser] = await pool.promise().query(
            "INSERT INTO usuarios (nombre, apellido, email, contraseña, rol) VALUES ('Nails', 'Art', 'admin12@gmail.com', ?, 'admin')",
            [passwordHash]
            );

            if (insertUser.affectedRows) {
            console.log('Usuario administrador insertado correctamente en la base de datos.');
            } else {
            console.log('No se pudo insertar el usuario administrador en la base de datos.');
            }
        } else {
            console.log('Ya existe un administador en la base de datos. No se insertará uno nuevo.');
        }
        } catch (error) {
        console.error('Error al insertar el usuario administrador:', error.message);
        } finally {

        }
    }


    insertarAdmin();
    exports.loginUser = async (req, res) => {
        try {
            const { email, contrasena } = req.body;
            console.log('Datos recibidos para iniciar sesión:', req.body);

            if (!email || !contrasena) {
                return res.status(400).json({ message: "Faltan campos obligatorios" });
            }

            const [user] = await pool.promise().query("SELECT * FROM usuarios WHERE email = ?", [email]);
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
                    fotoUsuario: user[0].fotoUsuario,
                    rol: user[0].rol
                }
            });
        } catch (error) {
            console.error('Error en el controlador de inicio de sesión:', error);
            return res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    };

// Controlador en Node.js para actualizar la imagen del usuario

exports.actualizarImagenUsuario = async (req, res) => {
    try {
        const userId = req.params.id; // Obtener el ID del usuario desde los parámetros de la solicitud
        let fileUrl = getDefaultImageURL(); // Obtiene la URL de la imagen por defecto

        if (req.file) {
            fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path}`; // URL de la imagen subida

            // Verificar si hay una persona vestida en la imagen utilizando la IA de detección de imágenes
            const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
            const prompt = "¿Hay una persona vestida en esta imagen?";
            const imageParts = [fileToGenerativePart(req.file.path, "image/jpeg")];
            const result = await model.generateContent([prompt, ...imageParts]);
            const response = await result.response;
            const text = await response.text();

            if (text.toLowerCase().includes("sí")) {
                // La imagen es válida y se puede actualizar
                await pool.promise().query("UPDATE usuarios SET fotoUsuario = ? WHERE id = ?", [fileUrl, userId]);

                return res.status(200).json({ message: "Imagen de perfil actualizada correctamente", fileUrl });
            } else {
                // La imagen no es válida (no hay una persona vestida)
                return res.status(400).json({ message: "La imagen no es adecuada para actualizar el perfil" });
            }
        } else {
            // No se subió ninguna imagen
            return res.status(400).json({ message: "No se proporcionó ninguna imagen para actualizar el perfil" });
        }
    } catch (error) {
        console.error('Error al actualizar la imagen de perfil del usuario:', error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};
