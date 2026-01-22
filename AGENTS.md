# Agents.md

# AI Agents Guidelines — E-commerce Project

## Purpose

This document defines strict operational rules for AI agents interacting with this repository.
The goal is to ensure **stability, SEO performance, data integrity, and commercial safety** in an online store environment.

Agents must prioritize **predictability over creativity**.

---

## Project Type

* E-commerce (online product sales)
* SEO-first
* Production-grade system
* Real users, real payments, real inventory

---

## Tech Stack (Authoritative)

Agents MUST NOT introduce alternatives.

* Next.js (latest stable, App Router only)
* TypeScript (strict mode)
* Prisma ORM (latest)
* PostgreSQL
* Tailwind CSS
* Server Actions preferred
* Vercel-compatible runtime

---

## Architectural Principles

### Rendering Strategy (SEO-First)

* Prefer **SSG** for:

  * Home
  * Category pages
  * Product pages (when possible)
* Use **SSR** only when data is user-specific or frequently changing
* Client Components are the exception, not the rule

### Business Logic Placement

* Business logic MUST live in:

  * Server Actions
  * Dedicated service files
* React components must remain **mostly presentational**
* No database access inside components

---

## SEO Rules (High Priority)

Agents MUST respect the following:

* Always use `generateMetadata`
* Never manipulate `<head>` manually
* Product pages must include:

  * title
  * description
  * Open Graph metadata
* Category and product slugs must be human-readable
* Never block indexing without explicit instruction
* Avoid JavaScript-only rendering for indexable content

---

## Images & Media

* Always use `next/image`
* Prefer modern formats (webp, avif)
* Images must have meaningful `alt` text
* No remote images unless explicitly allowed
* Product images should be optimized for performance and LCP

---

## Prisma & Database Rules (Critical)

* DO NOT modify `schema.prisma` without explicit request
* DO NOT remove existing models or fields
* Always respect soft-delete patterns (`deletedAt`)
* No raw SQL
* Use transactions for:

  * Orders
  * Stock updates
  * Payment-related operations
* Never fake or auto-generate production data

---

## E-commerce Domain Rules

### Products

* Stock must never go negative
* Product visibility must respect:

  * `active`
  * `deletedAt`
* Price changes must not break historical orders

### Orders

* Orders are immutable after payment confirmation
* Never alter order totals retroactively
* Always assume concurrency (race conditions exist)

### Payments

* Do NOT alter payment flows without approval
* Do NOT mock payment providers in production logic
* Never log sensitive payment data

---

## Performance Rules

* Avoid unnecessary `useEffect`
* Avoid global state unless justified
* Do not introduce heavy client-side libraries
* Prefer server-side data aggregation
* Avoid N+1 queries (use Prisma includes/selects wisely)

---

## Code Style & Quality

* Use `async/await` exclusively
* Avoid `any`
* Prefer early returns
* Functions must be explicit and small
* Follow existing folder and naming conventions
* No speculative refactors

---

## Dependency Management

* Do NOT add new dependencies without approval
* Prefer native platform features
* Avoid experimental libraries in production code

---

## Forbidden Actions (Hard Rules)

Agents MUST NOT:

* Remove existing features
* Change authentication or authorization logic
* Modify checkout or payment flows
* Change database schema without permission
* Introduce breaking changes silently
* Generate mock data in production paths

---

## Agent Behavior Expectations

* Be conservative
* Be explicit
* Ask for clarification when instructions are ambiguous
* Optimize for long-term maintainability, not short-term speed

---

## Final Note

This project prioritizes **SEO, reliability, and commercial integrity**.
Any action that risks rankings, data loss, or checkout stability is unacceptable.


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