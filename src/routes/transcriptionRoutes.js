// src/routes/transcriptionRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // <--- Módulo fs importado aquí
const transcriptionController = require('../controllers/transcriptionController');

const router = express.Router();

// Ruta a la carpeta 'uploads' relativa a la raíz del proyecto
// __dirname es /Users/miguelojedarios/clinica-transcripcion-backend/src/routes
// ../../ es /Users/miguelojedarios/clinica-transcripcion-backend/
const uploadsDest = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Asegurarse de que el directorio exista o crearlo
        if (!fs.existsSync(uploadsDest)) {
            try {
                fs.mkdirSync(uploadsDest, { recursive: true });
                console.log(`Carpeta 'uploads' creada o verificada en: ${uploadsDest}`);
            } catch (err) {
                console.error(`Error al crear o verificar la carpeta 'uploads' en ${uploadsDest}:`, err);
                // Devolver un error a multer si no se puede crear el directorio
                return cb(err);
            }
        }
        cb(null, uploadsDest); 
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // Límite de 50MB (ajustar según necesidad)
});

// Endpoint para subir audio y obtener transcripción + análisis
// El nombre 'audioFile' debe coincidir con el nombre del campo en el FormData del frontend
router.post('/upload', upload.single('audioFile'), transcriptionController.handleAudioUploadAndTranscription);

module.exports = router;