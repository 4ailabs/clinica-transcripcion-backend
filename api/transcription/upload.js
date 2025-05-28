// api/transcription/upload.js
const multer = require('multer');

// Configurar multer para manejar archivos en memoria
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB límite
    },
    fileFilter: (req, file, cb) => {
        // Aceptar solo archivos de audio
        if (file.mimetype.startsWith('audio/') || 
            file.mimetype === 'video/webm' ||
            file.originalname.toLowerCase().endsWith('.webm')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de audio'), false);
        }
    }
});

// Función para inicializar Google Speech Client
function initSpeechClient() {
    try {
        const { SpeechClient } = require('@google-cloud/speech');
        
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            console.log('Inicializando con credenciales de variable de entorno...');
            const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
            return new SpeechClient({ credentials });
        } else {
            console.log('Usando credenciales por defecto...');
            return new SpeechClient();
        }
    } catch (error) {
        console.error('Error inicializando Google Speech Client:', error);
        return null;
    }
}

// Función para transcribir audio
async function transcribeAudio(audioBuffer, mimeType, filename) {
    const speechClient = initSpeechClient();
    
    if (!speechClient) {
        throw new Error('No se pudo inicializar Google Speech Client. Verifica las credenciales.');
    }

    console.log(`Procesando audio: ${filename}, tipo: ${mimeType}, tamaño: ${audioBuffer.length} bytes`);

    // Configurar la solicitud de transcripción
    const request = {
        audio: {
            content: audioBuffer.toString('base64'),
        },
        config: {
            encoding: getAudioEncoding(mimeType, filename),
            sampleRateHertz: getSampleRate(mimeType),
            languageCode: 'es-MX',
            alternativeLanguageCodes: ['es-ES', 'es-US'],
            enableAutomaticPunctuation: true,
            enableWordTimeOffsets: false,
        },
    };

    try {
        console.log('Enviando solicitud a Google Speech-to-Text...');
        const [response] = await speechClient.recognize(request);
        
        if (!response.results || response.results.length === 0) {
            console.log('No se obtuvieron resultados de transcripción');
            return 'No se pudo transcribir el audio. El audio podría estar en silencio o ser muy corto.';
        }

        // Combinar todos los resultados de transcripción
        const transcription = response.results
            .map(result => result.alternatives && result.alternatives[0] ? result.alternatives[0].transcript : '')
            .filter(text => text.length > 0)
            .join(' ');

        console.log('Transcripción completada exitosamente');
        return transcription || 'No se pudo extraer texto del audio.';
        
    } catch (error) {
        console.error('Error en transcripción de Google:', error);
        
        // Manejo específico de errores comunes
        if (error.code === 3 || error.message.includes('Invalid audio encoding')) {
            throw new Error('Formato de audio no soportado. Intenta con un archivo WAV o MP3.');
        } else if (error.code === 11 || error.message.includes('too long')) {
            throw new Error('Audio demasiado largo. Máximo 60 segundos para archivos grandes.');
        } else if (error.code === 16 || error.message.includes('Unauthenticated')) {
            throw new Error('Error de autenticación con Google Cloud. Verifica las credenciales.');
        }
        
        throw new Error(`Error en transcripción: ${error.message}`);
    }
}

// Función para determinar la codificación de audio
function getAudioEncoding(mimeType, filename) {
    const type = mimeType.toLowerCase();
    const ext = filename.toLowerCase();
    
    if (type.includes('webm') || ext.includes('webm')) return 'WEBM_OPUS';
    if (type.includes('wav') || ext.includes('wav')) return 'LINEAR16';
    if (type.includes('mp3') || ext.includes('mp3')) return 'MP3';
    if (type.includes('mp4') || type.includes('m4a') || ext.includes('m4a')) return 'MP4';
    if (type.includes('flac') || ext.includes('flac')) return 'FLAC';
    
    // Por defecto, intentar LINEAR16
    return 'LINEAR16';
}

// Función para determinar sample rate
function getSampleRate(mimeType) {
    if (mimeType.includes('webm')) return 48000;
    return 16000; // Por defecto
}

// Función para analizar con Gemini
async function analyzeWithGemini(transcription) {
    try {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            console.error('GEMINI_API_KEY no configurada');
            return 'Error: API Key de Gemini no configurada. La transcripción se completó correctamente.';
        }

        console.log('Enviando transcripción a Gemini para análisis...');

        const prompt = `Eres un asistente médico especializado. Analiza esta transcripción de consulta médica:

"${transcription}"

Proporciona un análisis estructurado con:

**🔍 SÍNTOMAS IDENTIFICADOS:**
- Lista los síntomas mencionados

**🩺 EVALUACIÓN CLÍNICA:**
- Posibles diagnósticos a considerar
- Gravedad aparente

**📋 RECOMENDACIONES:**
- Estudios complementarios sugeridos
- Acciones inmediatas recomendadas

**⚠️ NOTAS IMPORTANTES:**
- Observaciones clínicas relevantes

Mantén un tono profesional y médico.`;

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
                    temperature: 0.4,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1500,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error de Gemini API:', response.status, errorText);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            console.log('Análisis de Gemini completado exitosamente');
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Respuesta inesperada de Gemini:', data);
            throw new Error('Respuesta inesperada de Gemini API');
        }
        
    } catch (error) {
        console.error('Error en análisis Gemini:', error);
        return `**Análisis IA no disponible:** ${error.message}

La transcripción se completó correctamente. El análisis con IA falló temporalmente.`;
    }
}

// Handler principal con mejor manejo de errores
module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Solo se permite método POST' });
    }

    console.log('=== Iniciando procesamiento de audio ===');

    try {
        // Procesar archivo con multer
        await new Promise((resolve, reject) => {
            upload.single('audioFile')(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        if (!req.file) {
            console.error('No se recibió archivo');
            return res.status(400).json({ error: 'No se recibió archivo de audio' });
        }

        console.log('Archivo recibido:', {
            name: req.file.originalname,
            size: req.file.size,
            type: req.file.mimetype,
            bufferLength: req.file.buffer.length
        });

        // Validar que el buffer no esté vacío
        if (!req.file.buffer || req.file.buffer.length === 0) {
            console.error('Buffer de archivo vacío');
            return res.status(400).json({ error: 'Archivo de audio vacío' });
        }

        // Transcribir audio
        console.log('Iniciando transcripción...');
        const transcription = await transcribeAudio(
            req.file.buffer, 
            req.file.mimetype, 
            req.file.originalname
        );
        
        console.log('Transcripción obtenida:', transcription.substring(0, 100) + '...');

        // Analizar con Gemini
        console.log('Iniciando análisis con Gemini...');
        const analysis = await analyzeWithGemini(transcription);

        console.log('=== Procesamiento completado exitosamente ===');

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

    } catch (error) {
        console.error('=== ERROR EN PROCESAMIENTO ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);

        res.status(500).json({
            error: 'Error procesando audio',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
};