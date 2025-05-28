// api/transcription/upload.js
module.exports = (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Por ahora, respuesta de prueba
        res.status(200).json({
            originalTranscription: "Esta es una transcripción de prueba. El servidor serverless está funcionando correctamente en Vercel.",
            geminiAnalysis: "Análisis de prueba: El sistema está operativo y listo para configurar los servicios de Google Cloud y Gemini AI. La arquitectura serverless está funcionando correctamente."
        });
    } catch (error) {
        console.error('Error in transcription:', error);
        res.status(500).json({
            error: 'Error processing transcription',
            message: error.message
        });
    }
};