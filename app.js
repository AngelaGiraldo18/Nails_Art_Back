const app = require('./index');

const puerto = 4000;
app.listen(puerto, function () {
    console.log('La aplicacion de nails art se encuentra en el puerto', puerto);
})