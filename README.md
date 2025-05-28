# Sistema de Transcripción Clínica - Backend

Backend para el sistema de transcripción de audio clínico usando Google Speech-to-Text y análisis con IA.

## 🚀 Características

- Transcripción de audio en tiempo real usando Google Speech-to-Text
- Análisis de contenido clínico usando Gemini AI
- API REST para manejo de archivos de audio
- Soporte para grabación en vivo y carga de archivos
- Frontend HTML incluido para pruebas

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- Cuenta de Google Cloud Platform
- API Key de Gemini AI
- Archivo de credenciales de Google Cloud

## 🛠 Instalación

1. Clona este repositorio:
```bash
git clone <tu-repositorio>
cd clinica-transcripcion-backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
   - Copia `.env.example` a `.env`
   - Completa las variables requeridas

4. Inicia el servidor:
```bash
npm start
```

## 🌍 Variables de Entorno

```env
PORT=3001
GOOGLE_APPLICATION_CREDENTIALS=ruta/a/tu/archivo/credenciales.json
GEMINI_API_KEY=tu_gemini_api_key
```

## 🚀 Despliegue en Vercel

1. Sube tu código a GitHub
2. Conecta tu repositorio con Vercel
3. Configura las variables de entorno en Vercel
4. Despliega automáticamente

## 📁 Estructura del Proyecto

```
├── src/
│   ├── controllers/
│   │   └── transcriptionController.js
│   ├── routes/
│   │   └── transcriptionRoutes.js
│   └── services/
│       ├── geminiService.js
│       └── googleSpeechService.js
├── uploads/
├── server.js
├── appconectada.html
└── package.json
```

## 🔗 API Endpoints

- `POST /api/transcription/upload` - Sube y transcribe archivo de audio

## 👨‍⚕️ Autor

Dr. Miguel Ojeda Ríos - Proyecto de Sistematización Clínica v1.0