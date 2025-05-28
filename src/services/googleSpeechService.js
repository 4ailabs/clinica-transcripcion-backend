// src/services/googleSpeechService.js
const { SpeechClient } = require('@google-cloud/speech');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs'); 
const path = require('path'); 

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
console.log(`Ruta de credenciales leída desde .env: ${credentialsPath}`);

let speechClient;
let storage;

if (credentialsPath && credentialsPath.trim() !== "" && fs.existsSync(credentialsPath)) {
    speechClient = new SpeechClient({ keyFilename: credentialsPath });
    storage = new Storage({ keyFilename: credentialsPath });
    console.log('SpeechClient y Storage inicializados explícitamente con keyFilename.');
} else {
    console.warn(`ADVERTENCIA: La ruta de credenciales "${credentialsPath}" no es válida o el archivo no existe. SpeechClient y Storage intentarán la inicialización por defecto.`);
    speechClient = new SpeechClient(); 
    storage = new Storage();
}

async function transcribeLongAudioFile(filePath, languageCode = 'es-MX') {
    const bucketName = 'audios-transcripcion-clinica-drmiguel'; 
    const fileNameInGcs = `audio_uploads_temp/${path.basename(filePath)}`;

    try {
        console.log(`Subiendo ${filePath} a gs://${bucketName}/${fileNameInGcs}...`);
        await storage.bucket(bucketName).upload(filePath, {
            destination: fileNameInGcs,
        });
        console.log('Archivo subido a GCS exitosamente.');

        const gcsUri = `gs://${bucketName}/${fileNameInGcs}`;
        const audio = {
            uri: gcsUri,
        };
        const config = {
            // Ajustado para WEBM OPUS grabado desde el navegador
            encoding: 'WEBM_OPUS', 
            sampleRateHertz: 48000, // MediaRecorder suele grabar a 48000 Hz
            languageCode: languageCode,
            enableAutomaticPunctuation: true,
            enableSpeakerDiarization: true,
            diarizationSpeakerCount: 2,
            // model: 'medical_dictation', 
        };
        const request = {
            audio: audio,
            config: config,
        };

        console.log(`Enviando solicitud de transcripción para ${gcsUri}...`);
        const [operation] = await speechClient.longRunningRecognize(request);
        const [response] = await operation.promise(); 
        console.log('Respuesta de transcripción recibida.');

        if (!response.results || response.results.length === 0) {
            console.warn('Google Speech-to-Text (long) no devolvió resultados para el audio en GCS.');
            return '';
        }
        
        let fullTranscription = "";
        response.results.forEach(result => {
            if (result.alternatives && result.alternatives.length > 0 && result.alternatives[0].words && result.alternatives[0].words.length > 0) {
                let currentSpeakerTag = null;
                result.alternatives[0].words.forEach(wordInfo => {
                    if (currentSpeakerTag !== wordInfo.speakerTag) {
                        fullTranscription += `\n[Hablante ${wordInfo.speakerTag}]: `;
                        currentSpeakerTag = wordInfo.speakerTag;
                    }
                    fullTranscription += wordInfo.word + " ";
                });
            } else if (result.alternatives && result.alternatives.length > 0) { 
                 fullTranscription += result.alternatives[0].transcript + "\n";
            }
        });

        console.log(`Transcripción (larga): ${fullTranscription.trim()}`);
        return fullTranscription.trim();

    } catch (error) {
        console.error('ERROR en Google Speech-to-Text (longRunningRecognize con GCS):', error);
        throw new Error('Fallo al transcribir el audio largo con Google Cloud y GCS.');
    } finally {
        try {
            console.log(`Intentando eliminar ${fileNameInGcs} de GCS del bucket ${bucketName}...`);
            await storage.bucket(bucketName).file(fileNameInGcs).delete();
            console.log(`Archivo ${fileNameInGcs} eliminado de GCS exitosamente.`);
        } catch (delError) {
            console.error(`Error al eliminar el archivo ${fileNameInGcs} de GCS del bucket ${bucketName}:`, delError.message);
        }
    }
}

module.exports = {
    transcribeLongAudioFile
};
