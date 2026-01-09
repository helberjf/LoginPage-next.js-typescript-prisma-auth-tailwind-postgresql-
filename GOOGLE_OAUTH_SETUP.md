# Google OAuth Setup Guide

## 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one

## 2. Enable Google+ API
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" and enable it
3. Also enable "Google People API" if needed

## 3. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3004/api/auth/callback/google` (for development)
   - Your production URL: `https://yourdomain.com/api/auth/callback/google`

## 4. Get Your Credentials
- **Client ID**: Copy the Client ID
- **Client Secret**: Copy the Client Secret

## 5. Configure Your .env File
Add these lines to your `.env` file:

```env
GOOGLE_CLIENT_ID="your_actual_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_actual_google_client_secret_here"
```

## 6. Test the Login
1. Start your development server: `npm run dev`
2. Go to http://localhost:3004/login
3. Click "Entrar com Google"
4. You should be redirected to Google for authentication

## Troubleshooting

### If you get "redirect_uri_mismatch"
- Make sure the redirect URI in Google Console matches exactly: `http://localhost:3004/api/auth/callback/google`
- Check that you're using the correct port number

### If Google login doesn't work
- Verify your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Check the browser console for errors
- Make sure the .env file is in the root directory