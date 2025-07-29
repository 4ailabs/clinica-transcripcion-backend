# Límites de Vercel para Transcripción de Audio

## Problema del Error 413

El error HTTP 413 "Payload Too Large" ocurre cuando el archivo de audio que intentas subir excede los límites de Vercel.

## Límites Configurados

### Límites de Vercel (Serverless Functions)
- **Tamaño máximo del body de la request**: 4.5MB
- **Tiempo de ejecución máximo**: 60 segundos (configurado en vercel.json)
- **Memoria**: 1024MB

### Límites de la Aplicación
- **Tamaño máximo de archivo**: 8MB (configurado en multer)
- **Tiempo máximo de grabación**: ~8 minutos
- **Formatos soportados**: WAV, MP3, WebM, M4A, FLAC

## Soluciones Implementadas

### 1. Configuración de vercel.json
```json
{
  "functions": {
    "api/transcription/upload.js": {
      "maxDuration": 60
    }
  }
}
```

### 2. Validación de Tamaño
- Validación en el frontend antes de subir
- Validación en el backend con multer (8MB)
- Validación adicional en el handler

### 3. Mensajes de Error Mejorados
- Información clara sobre el límite de tamaño
- Detalles del tamaño actual del archivo
- Sugerencias para reducir el tamaño

## Recomendaciones para Usuarios

### Para Archivos Grandes (>8MB)
1. **Comprimir el audio**: Usar formatos más eficientes como MP3 con bitrate reducido
2. **Dividir el archivo**: Si es una grabación muy larga, dividirla en segmentos más pequeños
3. **Reducir calidad**: Para transcripción, 16kHz mono es suficiente

### Formatos Recomendados para 8 Minutos
- **MP3 128kbps, 16kHz, mono**: ~8MB (máximo calidad)
- **MP3 96kbps, 16kHz, mono**: ~6MB (recomendado)
- **MP3 64kbps, 16kHz, mono**: ~4MB (máximo ahorro)
- **WAV 16kHz, 16-bit, mono**: ~4MB (sin compresión)
- **WebM Opus, 24kHz, mono**: ~3-4MB (muy eficiente)

### Tamaños Aproximados por Duración (8 minutos máximo)
- **1 minuto MP3 (128kbps)**: ~1MB
- **1 minuto WAV (16kHz)**: ~2MB
- **4 minutos MP3 (128kbps)**: ~4MB
- **6 minutos MP3 (128kbps)**: ~6MB
- **8 minutos MP3 (128kbps)**: ~8MB ✅
- **8 minutos MP3 (96kbps)**: ~6MB ✅
- **8 minutos MP3 (64kbps)**: ~4MB ✅

## Monitoreo

Los logs incluyen información sobre:
- Tamaño del archivo recibido
- Límites configurados
- Errores de validación de tamaño

## Próximos Pasos (Opcional)

Si necesitas manejar archivos más grandes, considera:
1. **Procesamiento en chunks**: Dividir archivos grandes en el frontend
2. **Upload directo a Google Cloud Storage**: Evitar pasar por Vercel
3. **Procesamiento asíncrono**: Usar colas de trabajo 