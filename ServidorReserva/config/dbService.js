
const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: '',
  password: '',
  database: '',
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
});

const insertReserva = (nombre, fecha, hora, servicio, manos_pies, manicuarista) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO reservas (nombre, fecha, hora, servicio, manos_pies, manicuarista) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [nombre, fecha, hora, servicio, manos_pies, manicuarista], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  insertReserva,
};
