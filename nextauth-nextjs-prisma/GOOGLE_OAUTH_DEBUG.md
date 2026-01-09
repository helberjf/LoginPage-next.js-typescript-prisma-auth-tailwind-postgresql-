# Google OAuth Debugging Guide

## 🔍 **Common Issues & Solutions**

### 1. **Invalid OAuth Credentials**
**Symptoms**: Redirect fails or shows "invalid_client"
**Check**:
```bash
# Verify credentials are loaded
npm run check-oauth
```

**Solution**: Make sure you have valid Google OAuth credentials from Google Cloud Console.

### 2. **Wrong Redirect URI**
**Current URI**: `http://localhost:3009/api/auth/callback/google`

**Required in Google Cloud Console**:
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- APIs & Services → Credentials
- Edit your OAuth 2.0 Client ID
- Add to "Authorized redirect URIs": `http://localhost:3009/api/auth/callback/google`

### 3. **OAuth App Not Enabled**
**Check**:
- In Google Cloud Console, go to "APIs & Services" → "Library"
- Search for "Google+ API" and make sure it's **ENABLED**
- Also enable "Google People API"

### 4. **Development vs Production URLs**
**For development**: Use `http://localhost:PORT/api/auth/callback/google`
**For production**: Use your actual domain

## 🧪 **Testing Steps**

### Step 1: Verify Configuration
```bash
npm run check-oauth
```
Should show:
```
GOOGLE_CLIENT_ID: ✅ SET
GOOGLE_CLIENT_SECRET: ✅ SET
AUTH_SECRET: ✅ SET
```

### Step 2: Test Provider Configuration
```bash
curl -s http://localhost:3009/api/auth/providers
```
Should return valid Google provider config.

### Step 3: Check for Errors
1. Open browser dev tools (F12)
2. Go to http://localhost:3009/login
3. Click "Entrar com Google"
4. Check console for errors
5. Check network tab for failed requests

### Step 4: Manual OAuth URL Test
Try accessing: `http://localhost:3009/api/auth/signin/google`

Should redirect to Google OAuth page.

## 🔧 **Quick Fixes**

### If credentials are wrong:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials
3. Create new OAuth 2.0 Client ID or copy existing ones
4. Update `.env.local` with correct values

### If redirect URI is wrong:
1. In Google Cloud Console, add: `http://localhost:3009/api/auth/callback/google`
2. Make sure no extra spaces or characters

### If API is not enabled:
1. Enable "Google+ API" in Google Cloud Console
2. Enable "Google People API"

## 🚨 **Error Codes & Solutions**

- **400 Bad Request**: Usually redirect URI mismatch
- **401 Unauthorized**: Invalid client credentials
- **redirect_uri_mismatch**: Wrong redirect URI in Google Console
- **invalid_client**: Wrong client ID or secret

## 📞 **Need Help?**
If you're still having issues:
1. Check Google Cloud Console OAuth configuration
2. Verify your credentials in `.env.local`
3. Make sure the redirect URI matches exactly
4. Try creating a new OAuth app if the current one is corrupted