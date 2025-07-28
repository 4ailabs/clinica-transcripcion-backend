// api/test-env.js
module.exports = (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Solo se permite método GET' });
    }

    // Verificar variables de entorno
    const envStatus = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        
        // Google Cloud
        googleCredentials: {
            hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
            credentialsType: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 
                (process.env.GOOGLE_APPLICATION_CREDENTIALS.startsWith('{') ? 'JSON_STRING' : 'FILE_PATH') : 
                'NOT_SET',
            credentialsLength: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 
                process.env.GOOGLE_APPLICATION_CREDENTIALS.length : 0
        },
        
        // Gemini AI
        gemini: {
            hasApiKey: !!process.env.GEMINI_API_KEY,
            apiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
            apiKeyPreview: process.env.GEMINI_API_KEY ? 
                process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 
                'NOT_SET'
        },
        
        // Otras variables
        port: process.env.PORT || 'NOT_SET',
        nodeVersion: process.version,
        platform: process.platform
    };

    // Intentar inicializar Google Speech Client
    try {
        const { SpeechClient } = require('@google-cloud/speech');
        let speechClient;
        
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS.startsWith('{')) {
                // Es un JSON string
                const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
                speechClient = new SpeechClient({ credentials });
            } else {
                // Es una ruta de archivo
                speechClient = new SpeechClient({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS });
            }
        } else {
            speechClient = new SpeechClient();
        }
        
        envStatus.googleSpeechClient = {
            status: 'INITIALIZED',
            message: 'Google Speech Client se inicializó correctamente'
        };
    } catch (error) {
        envStatus.googleSpeechClient = {
            status: 'ERROR',
            message: error.message,
            error: error.toString()
        };
    }

    // Verificar si axios está disponible
    try {
        const axios = require('axios');
        envStatus.axios = {
            status: 'AVAILABLE',
            version: require('axios/package.json').version
        };
    } catch (error) {
        envStatus.axios = {
            status: 'ERROR',
            message: error.message
        };
    }

    res.status(200).json(envStatus);
}; 