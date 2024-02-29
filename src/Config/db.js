const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

pool.getConnection((error, connection) => {
    if (error) {
        console.error(`error al conectar la base de datos "${process.env.DATABASE}"`, error);
        return;
    }
    console.log(`Conexion exitosa con la base de datos "${process.env.DATABASE}"`);
    connection.release(); 
});

module.exports = { pool};