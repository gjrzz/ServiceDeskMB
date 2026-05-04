#!/usr/bin/env node

/**
 * Script para gerar chaves secretas para JWT
 * 
 * Uso:
 *   node generate-secrets.js
 * 
 * Copie as chaves geradas para as variáveis de ambiente no Railway
 */

const crypto = require('crypto');

console.log('\n🔐 Gerando chaves secretas para JWT...\n');
console.log('═'.repeat(70));

const jwtSecret = crypto.randomBytes(32).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');

console.log('\n📋 COPIE ESTAS VARIÁVEIS PARA O RAILWAY:\n');

console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('');

console.log('JWT_REFRESH_SECRET:');
console.log(jwtRefreshSecret);
console.log('');

console.log('═'.repeat(70));
console.log('\n⚠️  IMPORTANTE:');
console.log('   • Nunca compartilhe estas chaves');
console.log('   • Use chaves diferentes para cada ambiente');
console.log('   • Guarde estas chaves em local seguro');
console.log('   • No Railway: Settings > Variables > + New Variable\n');

// Também salvar em arquivo temporário (não commitado)
const fs = require('fs');
const envContent = `
# Chaves geradas em ${new Date().toISOString()}
# COPIE PARA O RAILWAY E DELETE ESTE ARQUIVO!

JWT_SECRET="${jwtSecret}"
JWT_REFRESH_SECRET="${jwtRefreshSecret}"
`;

fs.writeFileSync('.env.secrets.tmp', envContent.trim());
console.log('✅ Chaves também salvas em: .env.secrets.tmp');
console.log('   (Delete este arquivo após copiar para o Railway)\n');
