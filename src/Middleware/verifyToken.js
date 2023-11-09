const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;

function verifyToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];

    if (typeof bearerHeader !== "undefined") {
        const bearerToken = bearerHeader.split(" ")[1];
        console.log('Token recibido:', bearerToken); // Agrega esta línea para imprimir el token
        req.token = bearerToken;

        // Verificar el token
        jwt.verify(bearerToken, secretKey, (err, data) => {
            if (err) {
                console.error('Error al verificar el token:', err);
                res.status(403).json({ error: 'Token no válido' });
            } else {
                console.log('Token verificado correctamente:', data);
                next();
            }
        });
    } else {
        res.status(403).json({ error: "Usted no se encuentra autenticado en la aplicación" });
    }
}

module.exports = verifyToken;
