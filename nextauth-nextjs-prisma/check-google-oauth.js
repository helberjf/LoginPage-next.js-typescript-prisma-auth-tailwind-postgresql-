#!/usr/bin/env node

// Script to verify Google OAuth environment variables
console.log('🔍 Checking Google OAuth Configuration...\n');

// Check environment variables
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const authSecret = process.env.AUTH_SECRET;

console.log('GOOGLE_CLIENT_ID:', clientId ? '✅ SET' : '❌ NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', clientSecret ? '✅ SET' : '❌ NOT SET');
console.log('AUTH_SECRET:', authSecret ? '✅ SET' : '❌ NOT SET');

console.log('\n📋 Next Steps:');
if (!clientId || !clientSecret) {
  console.log('1. Follow GOOGLE_OAUTH_SETUP.md to get your Google OAuth credentials');
  console.log('2. Add them to your .env file');
  console.log('3. Restart your development server');
} else {
  console.log('✅ Google OAuth is configured correctly!');
  console.log('🚀 Your Google login should now work at http://localhost:3004/login');
}

console.log('\n🔗 Test URLs:');
console.log('- Login Page: http://localhost:3004/login');
console.log('- Google Auth Callback: http://localhost:3004/api/auth/callback/google');