
const express = require('express');
const corsMiddleware = require('./middlewares/corsMiddleware');
const reservaRoutes = require('./routes/ReservaRoutes');

const app = express();
const port = 3000;

app.use(corsMiddleware);
app.use(express.json());  


app.use('/reserva', reservaRoutes);

app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});
