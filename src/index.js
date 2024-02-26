const express = require('express');
const bodyParser = require('body-parser');
const app = express()
.use(bodyParser.json())
const cors = require('cors');

const {API_KEY_GEMINI, START_CHAT, GENERATION_CONFIG} = require('./Config/config')

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(API_KEY_GEMINI);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const routes = require('./Routes/Routes');
const dotenv = require('dotenv');

dotenv.config();

app.use(cors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Configurar cabeceras de CSP
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; object-src 'self' uploads/;");
    next();
});

// Después de tus rutas
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('¡Algo salió mal!');
});


// Asegúrate de que la carpeta de carga exista
// Asegúrate de que la carpeta de carga exista
const fs = require('fs');
const uploadDir = './uploads';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('Carpeta de carga creada:', uploadDir);
} else {
    console.log('La carpeta de carga ya existe:', uploadDir);
}

app.post('/chat', async (req, res) => {
    let history = req.body.history;
    let question = req.body.question;
    let historyChat = START_CHAT.concat(history)
    const chat = model.startChat({
      history: historyChat,
      generationConfig: GENERATION_CONFIG
    });
    const sendQuestion = await chat.sendMessage(question);
    const response = await sendQuestion.response;
    const text = response.text();
    history.push({role: "user", parts: question})
    history.push({role: "model", parts: text})
    return res.status(200).json({history: history});
  })


module.exports = app;
app.use("/api", routes);