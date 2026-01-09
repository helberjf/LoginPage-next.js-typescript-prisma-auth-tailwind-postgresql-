# Agents.md

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Vitest (watch mode)
- `npm run test:run` - Run tests once (CI mode)
- `npm run db:push` - Push database schema (loads .env.local)
- `npm run db:migrate` - Run database migrations (loads .env.local)
- `npm run db:seed` - Seed database with test data (loads .env.local)

## Code Style
- **Language**: TypeScript with strict mode, Next.js 16, React 19
- **Imports**: Use `@/` alias for absolute imports, relative paths for local files
- **Naming**: camelCase for variables/functions, PascalCase for React components
- **Components**: Add `"use client"` directive for client-side components
- **Error Handling**: Use try/catch blocks, Zod schemas for validation, console.error for logging
- **API Routes**: Use NextResponse with appropriate HTTP status codes
- **Styling**: Tailwind CSS with conditional classes via cn() utility
- **Authentication**: NextAuth with Prisma adapter and JWT sessions