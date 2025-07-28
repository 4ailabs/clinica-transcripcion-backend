# 🔧 Solución para Problemas de IA en Vercel

## 🚨 Problema Identificado
La IA no funciona en Vercel porque las **variables de entorno no están configuradas correctamente**.

## ✅ Solución Paso a Paso

### 1. Configurar Variables de Entorno en Vercel

Ve a tu dashboard de Vercel y configura estas variables:

#### A. Google Cloud Credentials
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea o usa una cuenta de servicio existente
3. Descarga el archivo JSON de credenciales
4. **IMPORTANTE**: Copia TODO el contenido del archivo JSON
5. En Vercel, agrega la variable:
   - **Nombre**: `GOOGLE_APPLICATION_CREDENTIALS`
   - **Valor**: Todo el contenido del JSON (como string)

#### B. Gemini AI API Key
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. En Vercel, agrega la variable:
   - **Nombre**: `GEMINI_API_KEY`
   - **Valor**: Tu API key de Gemini

### 2. Verificar Configuración

Después de configurar las variables:

1. Ve a tu aplicación en Vercel
2. Visita: `https://tu-app.vercel.app/api/test-env`
3. Deberías ver algo como:
```json
{
  "googleCredentials": {
    "hasCredentials": true,
    "credentialsType": "JSON_STRING"
  },
  "gemini": {
    "hasApiKey": true,
    "apiKeyLength": 39
  }
}
```

### 3. Probar la Funcionalidad

1. Ve a tu aplicación principal: `https://tu-app.vercel.app/`
2. Graba o sube un archivo de audio
3. La transcripción y análisis de IA deberían funcionar

## 🔍 Diagnóstico de Problemas

### Si `/api/test-env` muestra errores:

#### Error: "GOOGLE_APPLICATION_CREDENTIALS not set"
- **Solución**: Configura la variable en Vercel con el JSON completo

#### Error: "GEMINI_API_KEY not set"
- **Solución**: Configura la variable en Vercel con tu API key

#### Error: "Google Speech Client initialization failed"
- **Solución**: Verifica que el JSON de credenciales sea válido

### Si la transcripción falla:

#### Error: "Audio encoding not supported"
- **Solución**: El audio debe ser WAV, MP3, o WebM

#### Error: "Audio too long"
- **Solución**: Reduce la duración del audio (máximo 60 segundos)

## 📋 Checklist de Verificación

- [ ] Variables de entorno configuradas en Vercel
- [ ] `/api/test-env` muestra configuración correcta
- [ ] `/api/health` responde correctamente
- [ ] Frontend carga sin errores
- [ ] Grabación de audio funciona
- [ ] Transcripción funciona
- [ ] Análisis de IA funciona

## 🆘 Si el Problema Persiste

1. **Revisa los logs de Vercel**:
   - Ve a tu proyecto en Vercel
   - Click en "Functions" → "View Function Logs"

2. **Verifica las credenciales**:
   - Asegúrate de que la cuenta de servicio tenga permisos para Speech-to-Text
   - Verifica que la API key de Gemini sea válida

3. **Contacta soporte**:
   - Si todo está configurado correctamente pero no funciona
   - Incluye los logs de error en tu reporte

## 🎯 Comandos Útiles

```bash
# Verificar configuración local
node scripts/check-setup.js

# Instalar dependencias
npm install

# Probar localmente (con .env configurado)
npm start
```

## 📞 Soporte

Si necesitas ayuda adicional:
1. Revisa los logs de Vercel
2. Verifica la configuración con `/api/test-env`
3. Asegúrate de que las variables de entorno estén correctamente configuradas 