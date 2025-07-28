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

### Para Desarrollo Local
Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3001
GOOGLE_APPLICATION_CREDENTIALS=ruta/a/tu/archivo/credenciales.json
GEMINI_API_KEY=tu_gemini_api_key
```

### Para Vercel (Producción)
Configura las siguientes variables de entorno en tu proyecto de Vercel:

1. **GOOGLE_APPLICATION_CREDENTIALS**: 
   - Copia TODO el contenido del archivo JSON de credenciales de Google Cloud
   - Debe ser un JSON válido como string

2. **GEMINI_API_KEY**: 
   - Tu API key de Gemini AI

3. **PORT**: 
   - Vercel lo configura automáticamente

### Verificar Configuración
Visita `/api/test-env` para verificar que las variables estén configuradas correctamente.

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

- `GET /` - Interfaz web principal
- `POST /api/transcription/upload` - Sube y transcribe archivo de audio
- `GET /api/health` - Verificar estado del servidor
- `GET /api/test-env` - Verificar configuración de variables de entorno

## 👨‍⚕️ Autor

Dr. Miguel Ojeda Ríos - Proyecto de Sistematización Clínica v1.0