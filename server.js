// server.js
require('dotenv').config(); // Cargar variables de entorno PRIMERO

console.log("--- DEBUG .ENV ---");
console.log("GOOGLE_APPLICATION_CREDENTIALS cargado:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log("PORT cargado:", process.env.PORT);
console.log("GEMINI_API_KEY cargado:", process.env.GEMINI_API_KEY);
console.log("GEMINI_API_ENDPOINT cargado:", process.env.GEMINI_API_ENDPOINT);
console.log("--- FIN DEBUG .ENV ---");

const express = require('express');
const cors = require('cors');
const path = require('path');
const transcriptionRoutes = require('./src/routes/transcriptionRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json()); // Para parsear JSON en el body de las solicitudes
app.use(express.urlencoded({ extended: true })); // Para parsear bodies URL-encoded

// Servir archivos estáticos (para CSS, JS, imágenes si las tienes)
app.use(express.static('.'));

// Ruta principal - servir la interfaz HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'appconectada.html'));
});

// Rutas de API
app.use('/api/transcription', transcriptionRoutes);

// Ruta de salud para verificar que el servidor funciona
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Manejador de errores básico
app.use((err, req, res, next) => {
    console.error("ERROR GLOBAL:", err.message);
    console.error(err.stack);
    res.status(500).send({ error: 'Algo salió mal en el servidor!', details: err.message });
});

// Manejar rutas no encontradas
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'appconectada.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Interfaz disponible en: http://localhost:${PORT}`);
});