// api/test-gemini.js
module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Solo se permite método GET' });
    }

    try {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        
        if (!geminiApiKey) {
            return res.status(400).json({
                error: 'GEMINI_API_KEY no configurada',
                message: 'Configura la variable de entorno GEMINI_API_KEY en Vercel'
            });
        }

        console.log('Probando conexión con Gemini API...');
        console.log('API Key length:', geminiApiKey.length);
        console.log('API Key preview:', geminiApiKey.substring(0, 10) + '...');

        // Test simple con Gemini
        const testPrompt = "Responde con 'OK' si puedes leer este mensaje.";
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: testPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 50,
                }
            })
        });

        console.log('Respuesta de Gemini:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error de Gemini:', errorText);
            
            return res.status(response.status).json({
                error: `Error ${response.status} en Gemini API`,
                details: errorText,
                apiKeyConfigured: true,
                apiKeyLength: geminiApiKey.length,
                testUrl: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey.substring(0, 10)}...`
            });
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const result = data.candidates[0].content.parts[0].text;
            
            return res.status(200).json({
                success: true,
                message: 'Conexión con Gemini API exitosa',
                response: result,
                apiKeyConfigured: true,
                apiKeyLength: geminiApiKey.length,
                model: 'gemini-1.5-flash',
                timestamp: new Date().toISOString()
            });
        } else {
            return res.status(500).json({
                error: 'Respuesta inesperada de Gemini',
                data: data,
                apiKeyConfigured: true,
                apiKeyLength: geminiApiKey.length
            });
        }

    } catch (error) {
        console.error('Error en test de Gemini:', error);
        
        return res.status(500).json({
            error: 'Error interno en test de Gemini',
            message: error.message,
            stack: error.stack,
            apiKeyConfigured: !!process.env.GEMINI_API_KEY,
            apiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
        });
    }
}; 