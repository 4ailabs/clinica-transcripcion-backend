// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use(express.static(__dirname));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'appconectada.html'));
});

// Ruta de salud
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando',
        timestamp: new Date().toISOString()
    });
});

// API placeholder (sin Google Cloud por ahora)
app.post('/api/transcription/upload', (req, res) => {
    res.json({
        originalTranscription: "Esta es una transcripción de prueba. El servidor está funcionando correctamente.",
        geminiAnalysis: "Análisis de prueba: El sistema está operativo y listo para configurar los servicios de Google Cloud y Gemini AI."
    });
});

// Manejar otras rutas
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'appconectada.html'));
});

// Exportar para Vercel
module.exports = app;