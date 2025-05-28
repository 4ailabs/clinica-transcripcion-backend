// src/services/geminiService.js
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// La URL del endpoint se construye usando la GEMINI_API_KEY si process.env.GEMINI_API_ENDPOINT no está definido o está vacío.
const GEMINI_API_ENDPOINT_FROM_ENV = process.env.GEMINI_API_ENDPOINT;
const DEFAULT_GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`; // Usando gemini-1.5-flash que es más reciente

const finalGeminiEndpoint = (GEMINI_API_ENDPOINT_FROM_ENV && GEMINI_API_ENDPOINT_FROM_ENV.trim() !== "") 
                            ? GEMINI_API_ENDPOINT_FROM_ENV 
                            : DEFAULT_GEMINI_ENDPOINT;

async function analyzeTranscriptionWithGemini(transcriptionText) {
    if (!GEMINI_API_KEY && !finalGeminiEndpoint.includes('key=')) {
        throw new Error("GEMINI_API_KEY no está configurada y el endpoint no la incluye.");
    }
    if (!transcriptionText) {
        throw new Error("No se proporcionó texto de transcripción para analizar.");
    }

    const promptFase1 = `
Eres un asistente experto para un terapeuta de biomagnetismo y bioenergética, el Dr. Miguel Ojeda Ríos.
Tu tarea es analizar la siguiente transcripción de la Fase 1 de una consulta ("Aterrizaje Clínico-Energético") y extraer información estructurada de manera clara y profesional, utilizando ÚNICAMENTE TEXTO PLANO para el formato.

**Contexto de la Fase 1:**
* Mini-entrevista clínica y exploración física.
* Definición de intención terapéutica.
* Evaluación express del terreno biológico (deficiencias, intoxicación, hábitos).
* Identificación simbólica del conflicto biológico (separación, territorio, duelo, etc.).
* Explicación breve del modelo: terreno ↔ conflicto ↔ memoria.

**Transcripción de la Consulta:**
---
${transcriptionText}
---

**Por favor, extrae y estructura la siguiente información de la transcripción anterior:**

1.  **Motivo Principal de la Consulta y Síntomas Clave:**
    * Describe el motivo principal expresado por el paciente.
    * Lista los síntomas clave mencionados, su duración aproximada si se indica, y cualquier evolución reportada.

2.  **Intención Terapéutica:**
    * Identifica la intención terapéutica expresada por el paciente (lo que busca lograr).
    * Si el terapeuta sugiere o define una intención, inclúyela también.

3.  **Evaluación del Terreno Biológico (Pistas):**
    * **Deficiencias/Intoxicación (Sospechas):** Menciona cualquier síntoma o comentario que pueda sugerir deficiencias nutricionales o algún tipo de intoxicación (ej. fatiga crónica, problemas de piel, niebla mental, exposición a tóxicos).
    * **Hábitos Relevantes:** Identifica comentarios sobre dieta, hidratación, sueño, ejercicio, niveles de estrés.

4.  **Conflicto Biológico Simbólico (Pistas):**
    * Identifica palabras clave, frases, emociones expresadas o eventos de vida mencionados que puedan sugerir un conflicto biológico simbólico (ej. relacionados con separación, pérdida de territorio, duelo no resuelto, desvalorización, amenaza, injusticia, etc.).
    * Si se menciona algún órgano o parte del cuerpo específicamente afectado en relación con una emoción o evento, anótalo.

5.  **Comprensión del Modelo Terapéutico:**
    * Indica si hay alguna mención o evidencia de que el paciente comprende (o se le explica) el modelo "terreno ↔ conflicto ↔ memoria".

**Instrucciones Adicionales de Formato para la Salida (MUY IMPORTANTE):**
* **TEXTO PLANO ÚNICAMENTE:** La salida completa DEBE SER en texto plano.
* **PROHIBIDO MARKDOWN:** NO utilices NINGÚN carácter de Markdown para dar formato. Esto incluye, pero no se limita a:
    * No usar asteriscos (*) para negritas, itálicas o listas.
    * No usar guiones bajos (_) para negritas o itálicas.
    * No usar acentos graves (\`) para código o texto monoespaciado.
    * No usar numerales (#, ##, ###) para encabezados.
* **Encabezados Claros:** Para cada una de las 5 secciones anteriores, usa el título de la sección en una línea separada, seguido de dos puntos (ej. "1. Motivo Principal de la Consulta y Síntomas Clave:"). No uses ningún tipo de énfasis (como negritas) para estos encabezados.
* **Párrafos y Saltos de Línea:** Utiliza párrafos simples y saltos de línea para separar claramente la información y los diferentes puntos dentro de cada sección.
* **Listas Simples (Formato Estricto):** Si necesitas enlistar sub-puntos (como los síntomas), utiliza el siguiente formato exacto, comenzando cada ítem en una nueva línea:
    a. Primer ítem de la lista.
    b. Segundo ítem de la lista.
    c. Y así sucesivamente.
    O bien:
    - Primer ítem de la lista (usando un guion simple seguido de un espacio).
    - Segundo ítem de la lista.
* **Lenguaje Profesional:** Mantén un tono claro, objetivo y profesional en toda la respuesta.
* **Concisión:** Sé lo más conciso posible sin omitir información relevante.

**Formato de Salida Deseado (Ejemplo Estricto de Texto Plano):**
Presenta la información de manera clara, concisa y estructurada usando los encabezados y las instrucciones de formato anteriores. Si alguna sección no tiene información clara en la transcripción, indica "No se encontró información clara" o una frase similar para esa sección. No inventes información.

Ejemplo de estructura y formato (SOLO EJEMPLO, NO DE CONTENIDO):
---
Análisis de la Fase 1 de la Consulta:

1. Motivo Principal de la Consulta y Síntomas Clave:
Motivo: El paciente refiere sentir [descripción].
Síntomas:
a. [Síntoma 1]: [Descripción detallada, duración si se menciona].
b. [Síntoma 2]: [Descripción detallada, duración si se menciona].

2. Intención Terapéutica:
Paciente: Busca [descripción de la intención del paciente].
Terapeuta (si aplica): No se encontró información clara.

(Y así sucesivamente para las demás secciones, manteniendo el formato de texto plano y listas simples)
---
`;

    const payload = {
        contents: [
            {
                parts: [{ text: promptFase1 }],
            },
        ],
        // generationConfig: {
        //   temperature: 0.3, // Más bajo para ser más literal a las instrucciones de formato
        //   topK: 1,
        //   topP: 1,
        //   maxOutputTokens: 2048, 
        // },
    };

    try {
        console.log(`Enviando solicitud a Gemini API con endpoint: ${finalGeminiEndpoint}`);
        const response = await axios.post(finalGeminiEndpoint, payload, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.data && response.data.candidates && response.data.candidates.length > 0 &&
            response.data.candidates[0].content && response.data.candidates[0].content.parts &&
            response.data.candidates[0].content.parts.length > 0) {
            const analysisResult = response.data.candidates[0].content.parts[0].text;
            console.log("Respuesta de Gemini recibida.");
            return analysisResult;
        } else {
            if (response.data && response.data.candidates && response.data.candidates.length > 0 && response.data.candidates[0].finishReason) {
                console.error("Respuesta de Gemini API indicó un problema:", response.data.candidates[0].finishReason, response.data.candidates[0].safetyRatings || '');
                throw new Error(`Respuesta de Gemini indicó un problema: ${response.data.candidates[0].finishReason}`);
            }
            console.error("Respuesta inesperada de Gemini API:", JSON.stringify(response.data, null, 2));
            throw new Error('Respuesta inesperada o vacía de la API de Gemini.');
        }

    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data, null, 2) : error.message;
        console.error('ERROR al llamar a la API de Gemini:', errorMessage);
        if (error.isAxiosError) {
            throw new Error(`Error de red o HTTP llamando a Gemini: ${error.message}`);
        }
        throw new Error(`Fallo al analizar la transcripción con Gemini: ${errorMessage}`);
    }
}

module.exports = { analyzeTranscriptionWithGemini };
