const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require("../../Config/db");
// Cargar variables de entorno desde el archivo .env
require('dotenv').config();
const multer = require('multer');
const secretKey = process.env.SECRET_KEY;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/') // Directorio donde se guardarán las imágenes
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname) // Nombre de archivo único
    }
  });
  const upload = multer({ storage: storage });
  
  exports.upload = multer({ storage: storage });
  exports.createManicurista = async (req, res) => {
    try {
      console.log('Datos de la manicurista:', req.body);
      console.log('Archivo de imagen:', req.file); // Información sobre el archivo de imagen subido
  
      const { nombre, apellido, emailPersonal, emailApp, contrasenaApp, celular, direccion, descripcion } = req.body;
  
      // Verificar si se ha subido una imagen
      if (!req.file) {
        return res.status(400).json({ message: "Debe subir una imagen" });
      }
  
      if (!nombre || !apellido || !emailPersonal || !emailApp || !contrasenaApp || !celular || !direccion) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }
  
      console.log('Petición recibida:', req.body);
  
      const [existingUser] = await pool.promise().query("SELECT * FROM manicurista WHERE emailApp = ?", [emailApp]);
  
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "El correo ya se encuentra registrado" });
      }
  
      const hashedPassword = await bcrypt.hash(contrasenaApp, 10);
  
      const [insertUser] = await pool.promise().query(
        "INSERT INTO usuarios (nombre, apellido, email, contraseña, rol) VALUES (?, ?, ?, ?, 'manicurista')",
        [nombre, apellido, emailApp, hashedPassword]
      );
  
      const usuarioId = insertUser.insertId;
  const photoFile = req.file;
const host = req.get('host');
const fileUrl = `${req.protocol}://${host}/${photoFile.path}`;
console.log('Solicitud recibida:', req.body, fileUrl, req.file);


const [insertManicurista] = await pool.promise().query(
    "INSERT INTO manicurista (id_manicurista, nombre, apellido, emailPersonal, emailApp, contraseñaApp, celular, direccion, descripcion, fotoManicurista) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [usuarioId, nombre, apellido, emailPersonal, emailApp, hashedPassword, celular, direccion, descripcion, fileUrl]
);

  
      if (insertManicurista.affectedRows) {
        const token = jwt.sign({ usuarioId }, secretKey, { expiresIn: '1h' });
        return res.status(200).json({ message: "Se ha creado correctamente la manicurista", token });
      } else {
        return res.status(500).json({ message: "No se ha podido crear la manicurista" });
      }
    } catch (error) {
      console.error('Error en el controlador:', error);
      return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
  };
  
  exports.getManicurista = async (req, res) => {
    try {
        const [manicuristas] = await pool.promise().query(`SELECT * FROM manicurista`);
        // Agregar la ruta completa de la imagen a cada manicurista
        const manicuristasConRutaDeImagen = manicuristas.map(manicurista => {
            if (manicurista.fotoManicurista) {
                return {
                    ...manicurista,
                    fotoManicurista: manicurista.fotoManicurista.replace(/\\/g, '/') 
                };
            } else {
                return manicurista;
            }
        });
        return res.status(200).json(manicuristasConRutaDeImagen);
    } catch (error) {
        console.error('Error en el controlador:', error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};
exports.updateManicurista = async (req, res) => {
  try {
    const { id_manicurista, nombre, apellido, emailPersonal, emailApp, contrasenaApp, celular, direccion, descripcion } = req.body;

    // Verificar si se proporcionó un ID de manicurista válido
    if (!id_manicurista) {
      return res.status(400).json({ message: "Falta el ID de la manicurista" });
    }

    // Verificar si la manicurista existe en la base de datos
    const [existingManicurista] = await pool.promise().query("SELECT * FROM manicurista WHERE id_manicurista = ?", [id_manicurista]);

    if (existingManicurista.length === 0) {
      return res.status(404).json({ message: "La manicurista no existe" });
    }

    let hashedPassword;

    // Verificar si se proporcionó una nueva contraseña y hashearla
    if (contrasenaApp) {
      hashedPassword = await bcrypt.hash(contrasenaApp, 10);
    }

    // Construir la consulta de actualización basada en los campos proporcionados
    let updateQuery = "UPDATE manicurista SET";
    let updateValues = [];

    // Agregar los campos a actualizar a la consulta y sus valores correspondientes
    if (nombre) {
      updateQuery += " nombre = ?,";
      updateValues.push(nombre);
    }
    if (apellido) {
      updateQuery += " apellido = ?,";
      updateValues.push(apellido);
    }
    if (emailPersonal) {
      updateQuery += " emailPersonal = ?,";
      updateValues.push(emailPersonal);
    }
    if (emailApp) {
      updateQuery += " emailApp = ?,";
      updateValues.push(emailApp);
    }
    if (contrasenaApp) {
      updateQuery += " contraseñaApp = ?,";
      updateValues.push(hashedPassword);
    }
    if (celular) {
      updateQuery += " celular = ?,";
      updateValues.push(celular);
    }
    if (direccion) {
      updateQuery += " direccion = ?,";
      updateValues.push(direccion);
    }
    if (descripcion) {
      updateQuery += " descripcion = ?,";
      updateValues.push(descripcion);
    }

    // Verificar si se proporcionó una nueva foto y agregarla a la consulta
    if (req.file) {

      const photoFile = req.file;
      const host = req.get('host');
      const fileUrl = `${req.protocol}://${host}/${photoFile.path}`;
      updateQuery += " fotoManicurista = ?,";
      updateValues.push(fileUrl); // Suponiendo que req.file.path contiene la ruta de la nueva foto
    }

    // Eliminar la coma final de la consulta de actualización
    updateQuery = updateQuery.slice(0, -1);

    // Agregar la cláusula WHERE para actualizar solo la manicurista correspondiente
    updateQuery += " WHERE id_manicurista = ?";
    updateValues.push(id_manicurista);

    // Ejecutar la consulta de actualización
    await pool.promise().query(updateQuery, updateValues);

    console.log('Manicurista actualizado correctamente');

    return res.status(200).json({ message: "Manicurista actualizado correctamente" });

  } catch (error) {
    console.error('Error en el controlador de actualización de manicurista:', error);

    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

exports.eliminarManicurista = async (req, res) => {
    try {
        const idmanicurista = req.params.idmanicurista;

        if (!idmanicurista) {
            return res.status(400).json({ message: 'Falta el ID del manicurista' });
        }

        const [existingManicurista] = await pool.promise().query("SELECT * FROM manicurista WHERE id_manicurista = ?", [idmanicurista]);

        if (existingManicurista.length === 0) {
            return res.status(404).json({ message: "El manicurista no existe" });
        }

        const deleteQuery = "DELETE FROM manicurista WHERE id_manicurista = ?";
        const [deleteResult] = await pool.promise().query(deleteQuery, [idmanicurista]);

        if (deleteResult.affectedRows > 0) {
            return res.status(200).json({ message: "Manicurista eliminado correctamente" });
        } else {
            return res.status(500).json({ message: "No se ha podido eliminar el manicurista" });
        }
    } catch (error) {
        console.error('Error en el controlador de eliminación de manicurista:', error);
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};



exports.loginManicurista = async (req, res) => {
    try {
        const { emailApp, contrasenaApp } = req.body;

        if (!emailApp || !contrasenaApp) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const [manicurista] = await pool.promise().query("SELECT * FROM manicurista WHERE emailApp = ?", [emailApp]);

        if (manicurista.length === 0) {
            return res.status(404).json({ message: "No se encontró la manicurista" });
        }

        const hashedPassword = manicurista[0].contraseñaApp;

        const isPasswordValid = await bcrypt.compare(contrasenaApp, hashedPassword);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        // Generar token de sesión
        const token = jwt.sign({ manicuristaId: manicurista[0].idmanicurista, rol: 'manicurista' }, secretKey, { expiresIn: '1h' });

        // Devolver datos de la manicurista y el token
        return res.status(200).json({
            message: "Inicio de sesión exitoso",
            nombre: manicurista[0].nombre,
            apellido: manicurista[0].apellido,
            token
        });

    } catch (error) {
        console.error('Error en el controlador de inicio de sesión de manicurista:', error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

exports.buscarPorNombre = async (req, res) => {
    try {
      const nombre = req.params.nombre;
  
      if (!nombre) {
        return res.status(400).json({ message: 'Falta el nombre para la búsqueda' });
      }
  
      const [manicuristas] = await pool.promise().query("SELECT * FROM manicurista WHERE nombre LIKE ?", [`%${nombre}%`]);
  
      if (manicuristas.length === 0) {
        return res.status(404).json({ message: "No se encontraron manicuristas con ese nombre" });
      }
  
      return res.status(200).json(manicuristas);
    } catch (error) {
      console.error('Error en el controlador de búsqueda de manicuristas por nombre:', error);
      return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  };
  
