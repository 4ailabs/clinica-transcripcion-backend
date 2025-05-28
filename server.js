// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Ruta principal - servir la interfaz HTML
app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'appconectada.html'));
    } catch (error) {
        console.error('Error serving HTML:', error);
        res.status(500).send('Error loading application');
    }
});

// Ruta de salud
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

// Rutas de API - cargar solo si existen los archivos
try {
    const transcriptionRoutes = require('./src/routes/transcriptionRoutes');
    app.use('/api/transcription', transcriptionRoutes);
} catch (error) {
    console.error('Error loading transcription routes:', error);
    app.use('/api/transcription', (req, res) => {
        res.status(500).json({ error: 'Transcription service temporarily unavailable' });
    });
}

// Manejador de errores
app.use((err, req, res, next) => {
    console.error("ERROR GLOBAL:", err.message);
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'appconectada.html'));
});

// Para Vercel, exportar la app en lugar de usar listen
if (process.env.VERCEL) {
    module.exports = app;
} else {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
        console.log(`Interfaz disponible en: http://localhost:${PORT}`);
    });
}