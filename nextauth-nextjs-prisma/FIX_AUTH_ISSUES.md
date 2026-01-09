# Fix Authentication Issues

## 1. Fix Environment Variables

Your `.env.local` file still has placeholder values. Replace them with real values:

```env
# Database - Set up PostgreSQL first
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name

# Auth Secret - Generate a random 32+ character string
AUTH_SECRET=your_random_32_character_secret_here

# Google OAuth - Get from Google Cloud Console
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3007
```

## 2. Set Up PostgreSQL Database

You need a running PostgreSQL database. Options:
- **Local PostgreSQL**: Install PostgreSQL locally
- **Docker**: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=mypassword postgres:13`
- **Cloud**: Use Neon, Supabase, or Railway

## 3. Generate AUTH_SECRET

Run this command to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add redirect URI: `http://localhost:3007/api/auth/callback/google`

## 5. Run Database Migration

Once database is set up:
```bash
npx prisma db push
```

## 6. Seed Database (Optional)

Create some test users:
```bash
npx tsx prisma/seed.ts
```

## Test Users (from seed):
- `alice@example.com` / `password123`
- `bob@example.com` / `password456`

## Current Issues:
- ❌ **Environment variables not loaded** (placeholders still in .env.local)
- ❌ **Database not connected** (PostgreSQL not running)
- ❌ **Google OAuth not configured** (placeholder credentials)

## Quick Test:
After fixing .env.local, run:
```bash
npm run check-oauth  # Should show ✅ for all variables
npm run dev         # Restart server
```

Then try login at http://localhost:3007/login