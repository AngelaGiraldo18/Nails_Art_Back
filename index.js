const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const secretKey = 'mi_clave_secreta';

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nailsArt'
});

function generarToken(usuario) {
  const payload = {
    nombre: usuario.nombre,
    id: usuario.id
  };
  const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

  return token;
}

app.post('/create', (req, res) => {
  const nombre = req.body.nombre;
  const apellido = req.body.apellido;
  const email = req.body.email;
  const contraseña = req.body.contraseña;

  // Verificar que todos los campos requeridos tengan valores válidos
  if (!nombre || !apellido || !email || !contraseña) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  db.query('INSERT INTO usuarios (nombre,apellido,email,contraseña) VALUES (?,?,?,?)',
    [nombre, apellido, email, contraseña],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: 'Error al crear el usuario' });
      } else {
        res.send(result);
      }
    }
  );
});


app.post('/createCitas', (req, res) => {
  const nombre = req.body.nombre;
  const correo = req.body.correo;
  const telefono = req.body.telefono;
  const fecha = req.body.fecha;
  const hora = req.body.hora;
  const servicio = req.body.servicio;
  const manos_pies = req.body.manos_pies;
  const manicuarista = req.body.manicuarista;

  db.query('INSERT INTO citas (nombre,correo,telefono,fecha,hora,servicio,Manos_Pies,manicurista) VALUES (?,?,?,?,?,?,?,?)',
    [nombre, correo, telefono, fecha, hora, servicio, manos_pies, manicuarista],
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.send(result);
      }
    }
  );
});

app.get('/login/:nombre/:pass', (req, res) => {
  const nombre = req.params.nombre;
  const contraseña = req.params.pass;

  db.query(
    'SELECT nombre, contraseña, id FROM usuarios WHERE nombre = ? AND contraseña = ?',
    [nombre, contraseña],
    (err, resultado) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        if (resultado.length > 0) {
          const usuario = resultado[0];
          const token = generarToken(usuario);
          res.json({ token });
        } else {
          res.sendStatus(401);
        }
      }
    }
  );
});

function verificarToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.sendStatus(403);
    }

    req.usuario = decoded;
    next();
  });
}

app.get('/ruta-protegida', verificarToken, (req, res) => {
  // Acción para la ruta protegida
  const usuario = req.usuario; // Obtén los datos del usuario desde el token verificado

  // Aquí puedes realizar alguna acción específica para el usuario autenticado
  // Por ejemplo, obtener información del usuario desde la base de datos
  // y responder con los datos solicitados.

  res.json({ mensaje: 'Acceso a la ruta protegida exitoso', usuario });
});
app.listen(3001, () => {
  console.log('Corriendo en el puerto 3001');
});
