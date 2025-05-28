// api/transcription/upload.js
const { SpeechClient } = require('@google-cloud/speech');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configurar multer para manejar archivos en memoria
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB límite
    },
});

// Inicializar cliente de Google Speech
let speechClient;
try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // En Vercel, las credenciales están como string JSON
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        speechClient = new SpeechClient({ credentials });
    } else {
        speechClient = new SpeechClient(); // Usar credenciales por defecto en desarrollo
    }
} catch (error) {
    console.error('Error inicializando Google Speech Client:', error);
}

// Función para transcribir audio
async function transcribeAudio(audioBuffer, mimeType) {
    if (!speechClient) {
        throw new Error('Google Speech Client no está configurado');
    }

    // Configurar la solicitud de transcripción
    const request = {
        audio: {
            content: audioBuffer.toString('base64'),
        },
        config: {
            encoding: getAudioEncoding(mimeType),
            sampleRateHertz: 16000,
            languageCode: 'es-MX', // Español México
            alternativeLanguageCodes: ['es-ES', 'es-US'],
            enableAutomaticPunctuation: true,
            enableWordTimeOffsets: false,
            model: 'latest_long', // Mejor para audio médico
        },
    };

    try {
        console.log('Iniciando transcripción con Google Speech-to-Text...');
        const [response] = await speechClient.recognize(request);
        
        if (!response.results || response.results.length === 0) {
            return 'No se pudo transcribir el audio. Intenta con un audio más claro.';
        }

        // Combinar todos los resultados de transcripción
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join(' ');

        console.log('Transcripción completada:', transcription.substring(0, 100) + '...');
        return transcription;
        
    } catch (error) {
        console.error('Error en transcripción:', error);
        if (error.code === 3) {
            throw new Error('Formato de audio no soportado. Usa WAV, MP3 o WEBM.');
        } else if (error.code === 11) {
            throw new Error('Audio demasiado largo. Máximo 60 segundos.');
        }
        throw new Error(`Error de transcripción: ${error.message}`);
    }
}

// Función para determinar la codificación de audio
function getAudioEncoding(mimeType) {
    if (mimeType.includes('webm')) return 'WEBM_OPUS';
    if (mimeType.includes('wav')) return 'LINEAR16';
    if (mimeType.includes('mp3')) return 'MP3';
    if (mimeType.includes('m4a')) return 'MP4';
    return 'LINEAR16'; // Por defecto
}

// Función para analizar con Gemini
async function analyzeWithGemini(transcription) {
    try {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            throw new Error('GEMINI_API_KEY no configurada');
        }

        const prompt = `Eres un asistente médico especializado en análisis clínico. 

Analiza la siguiente transcripción de una consulta médica y proporciona:

1. **Síntomas principales identificados**
2. **Posibles diagnósticos diferenciales**
3. **Recomendaciones de estudios complementarios**
4. **Observaciones clínicas importantes**

Transcripción: "${transcription}"

Proporciona un análisis profesional y estructurado:`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Respuesta inesperada de Gemini API');
        }
        
    } catch (error) {
        console.error('Error en análisis Gemini:', error);
        return `Error en análisis IA: ${error.message}. La transcripción se completó correctamente.`;
    }
}

// Handler principal
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Usar multer para procesar el archivo
        upload.single('audioFile')(req, res, async (err) => {
            if (err) {
                console.error('Error de multer:', err);
                return res.status(400).json({ 
                    error: 'Error procesando archivo', 
                    details: err.message 
                });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No se recibió archivo de audio' });
            }

            console.log('Archivo recibido:', {
                name: req.file.originalname,
                size: req.file.size,
                type: req.file.mimetype
            });

            try {
                // Transcribir audio
                const transcription = await transcribeAudio(req.file.buffer, req.file.mimetype);
                
                // Analizar con Gemini
                const analysis = await analyzeWithGemini(transcription);

                // Respuesta exitosa
                res.status(200).json({
                    originalTranscription: transcription,
                    geminiAnalysis: analysis,
                    metadata: {
                        filename: req.file.originalname,
                        size: req.file.size,
                        type: req.file.mimetype,
                        processedAt: new Date().toISOString()
                    }
                });

            } catch (transcriptionError) {
                console.error('Error en transcripción/análisis:', transcriptionError);
                res.status(500).json({
                    error: 'Error procesando audio',
                    details: transcriptionError.message
                });
            }
        });

    } catch (error) {
        console.error('Error general:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
};