// src/controllers/transcriptionController.js
console.log('--- Inicio Debugging en transcriptionController.js ---');
console.log('Directorio actual de trabajo (CWD):', process.cwd());
console.log('Directorio de este archivo (__dirname):', __dirname);
const path = require('path'); // Necesario para path.resolve y path.join
console.log('Ruta absoluta resuelta a la carpeta services:', path.resolve(__dirname, '../services'));

const fs = require('fs'); // Necesario para fs.existsSync y fs.unlink
const googleServicePath = path.resolve(__dirname, '../services/googleSpeechService.js');
console.log('Intentando resolver ruta para googleSpeechService.js:', googleServicePath);
console.log('¿Existe googleSpeechService.js en esa ruta?:', fs.existsSync(googleServicePath));

const geminiServicePath = path.resolve(__dirname, '../services/geminiService.js');
console.log('Intentando resolver ruta para geminiService.js:', geminiServicePath);
console.log('¿Existe geminiService.js en esa ruta?:', fs.existsSync(geminiServicePath));
console.log('--- Fin Debugging ---');

const { transcribeLongAudioFile } = require('../services/googleSpeechService.js');
const { analyzeTranscriptionWithGemini } = require('../services/geminiService.js');

// Ruta a la carpeta 'uploads' relativa a la raíz del proyecto
// __dirname es /Users/miguelojedarios/clinica-transcripcion-backend/src/controllers
// ../../ es /Users/miguelojedarios/clinica-transcripcion-backend/
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`Carpeta 'uploads' creada en: ${uploadsDir}`);
    } catch (err) {
        console.error(`Error al crear la carpeta 'uploads' en ${uploadsDir}:`, err);
    }
}

exports.handleAudioUploadAndTranscription = async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: 'No se recibió ningún archivo de audio.' });
    }

    const filePath = req.file.path; 

    try {
        console.log(`Archivo recibido: ${filePath}, iniciando transcripción...`);
        const transcription = await transcribeLongAudioFile(filePath); 

        if (!transcription && transcription !== "") { // Permitir transcripción vacía si es legítima
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, err => { if (err) console.error("Error al eliminar archivo temporal (transcripción vacía/fallida):", err);});
            }
            return res.status(500).send({ error: 'La transcripción no produjo resultados o falló.' });
        }
        
        console.log("Transcripción obtenida, enviando a Gemini para análisis...");
        const analysis = await analyzeTranscriptionWithGemini(transcription);

        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, err => {
                if (err) console.error("Error al eliminar archivo temporal después del procesamiento:", err);
                else console.log(`Archivo temporal ${filePath} eliminado.`);
            });
        }

        res.status(200).send({
            message: 'Audio procesado exitosamente.',
            originalTranscription: transcription,
            geminiAnalysis: analysis
        });

    } catch (error) {
        console.error('Error en el controlador de transcripción:', error.message, error.stack);
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, err => { if (err) console.error("Error al eliminar archivo temporal en caso de error del controlador:", err);});
        }
        res.status(500).send({ error: 'Error al procesar el audio.', details: error.message });
    }
};