#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración del Sistema de Transcripción Clínica...\n');

// Verificar estructura de archivos
const requiredFiles = [
    'package.json',
    'api/index.js',
    'api/transcription/upload.js',
    'api/health.js',
    'api/test-env.js',
    'src/services/googleSpeechService.js',
    'src/services/geminiService.js',
    'public/index.html',
    'vercel.json'
];

console.log('📁 Verificando archivos requeridos:');
let allFilesExist = true;
requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
});

// Verificar dependencias
console.log('\n📦 Verificando dependencias:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
    '@google-cloud/speech',
    '@google-cloud/storage',
    'axios',
    'cors',
    'dotenv',
    'express',
    'multer'
];

let allDepsExist = true;
requiredDeps.forEach(dep => {
    const exists = packageJson.dependencies && packageJson.dependencies[dep];
    console.log(`  ${exists ? '✅' : '❌'} ${dep}`);
    if (!exists) allDepsExist = false;
});

// Verificar variables de entorno
console.log('\n🔐 Verificando variables de entorno:');
const envFile = '.env';
const envExists = fs.existsSync(envFile);
console.log(`  ${envExists ? '✅' : '⚠️'} Archivo .env ${envExists ? 'existe' : 'no existe'}`);

if (envExists) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    const hasGoogleCreds = envContent.includes('GOOGLE_APPLICATION_CREDENTIALS');
    const hasGeminiKey = envContent.includes('GEMINI_API_KEY');
    
    console.log(`  ${hasGoogleCreds ? '✅' : '❌'} GOOGLE_APPLICATION_CREDENTIALS`);
    console.log(`  ${hasGeminiKey ? '✅' : '❌'} GEMINI_API_KEY`);
}

// Resumen
console.log('\n📋 RESUMEN:');
console.log(`  Archivos requeridos: ${allFilesExist ? '✅ Completos' : '❌ Faltan archivos'}`);
console.log(`  Dependencias: ${allDepsExist ? '✅ Completas' : '❌ Faltan dependencias'}`);
console.log(`  Variables de entorno: ${envExists ? '✅ Configuradas' : '⚠️ No configuradas'}`);

if (!allFilesExist || !allDepsExist) {
    console.log('\n❌ Hay problemas que necesitan ser resueltos antes de continuar.');
    process.exit(1);
}

if (!envExists) {
    console.log('\n⚠️  Para desarrollo local, crea un archivo .env con las variables necesarias.');
    console.log('   Para Vercel, configura las variables de entorno en el dashboard.');
}

console.log('\n✅ Verificación completada. El proyecto está listo para usar.');
console.log('\n🚀 Para probar:');
console.log('   1. Desarrollo local: npm start');
console.log('   2. Vercel: git push (después de configurar variables de entorno)');
console.log('   3. Verificar: visita /api/test-env en tu aplicación');