const jwt = require('jsonwebtoken');
const { pool } = require("../../Config/db");

exports.createManicurista = async (req, res) => {
    try {
        console.log('Datos de la manicurit@:', req.body);

        const { nombre, apellido, email, celular,direccion,descripcion,estado } = req.body;

        if (!nombre || !apellido || !email || !celular|| !direccion|| !estado ) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }
        console.log('Petición recibida:', req.body);

        const [existingUser] = await pool.promise().query("SELECT * FROM manicurista WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "El correo ya se encuentra registrado" });
        }

        const [insertUser] = await pool.promise().query(
            "INSERT INTO manicurista (nombre, apellido, email, celular,direccion,descripcion,estado ) VALUES (?, ?, ?, ?, ?,?,?)",
            [nombre, apellido, email, celular,direccion,descripcion,estado ]
        );

        if (insertUser.affectedRows) {
            const usuarioId = insertUser.insertId; 
            // Comentamos la línea que utiliza process.env.SECRET_KEY y proporcionamos un token estático para prueba
            // const token = jwt.sign({ usuarioId }, process.env.SECRET_KEY, { expiresIn: '1h' });
            const staticToken = 'token_estatico_de_prueba'; // Reemplaza con el token que desees
            return res.status(200).json({ message: "Se ha creado correctamente la manicurist@", token: staticToken });
        } else {
            return res.status(500).json({ message: "No se ha podido crear la manicurist@" });
        }
    } catch (error) {
        console.error('Error en el controlador:', error);
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

exports.getManicuristas = (req, res, next) => {
    db.query('SELECT * FROM manicurista', (error, results, fields) => {
      if (error) {
        return res.status(500).json({
          message: 'Error al obtener las manicuristas',
          error: error
        });
      }
  
      res.status(200).json({
        manicuristas: results
      });
    });
  };