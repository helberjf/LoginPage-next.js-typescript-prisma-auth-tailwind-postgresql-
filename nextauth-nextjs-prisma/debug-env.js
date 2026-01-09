#!/usr/bin/env node

// Debug script to check all environment variables
console.log('🔍 Environment Variables Debug\n');

const envVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'AUTH_SECRET',
  'DATABASE_URL',
  'NEXT_PUBLIC_BASE_URL'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ SET' : '❌ NOT SET';
  const displayValue = value ? `"${value.substring(0, 20)}${value.length > 20 ? '...' : ''}"` : '';
  console.log(`${varName}: ${status} ${displayValue}`);
});

console.log('\n📂 Checking .env file...');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const envLocalPath = path.join(process.cwd(), '.env.local');

try {
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file exists');
    const content = fs.readFileSync(envPath, 'utf8');
    console.log(`📄 .env file has ${content.split('\n').length} lines`);
  } else {
    console.log('❌ .env file does not exist');
  }

  if (fs.existsSync(envLocalPath)) {
    console.log('✅ .env.local file exists');
  } else {
    console.log('ℹ️  .env.local file does not exist (this is normal)');
  }
} catch (error) {
  console.log('❌ Error reading .env file:', error.message);
}