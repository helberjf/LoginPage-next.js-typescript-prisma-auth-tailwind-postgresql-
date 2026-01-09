This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Este é um repositório de demonstração que mostra como construir uma aplicação web full-stack utilizando Next.js, Prisma Client e Prisma Postgres. O projeto implementa um sistema completo com autenticação via GitHub OAuth, gerenciamento de banco de dados PostgreSQL e interface de usuário moderna. É um exemplo prático ideal para desenvolvedores aprenderem sobre integração de Prisma ORM com Next.js, incluindo provisioning instantâneo de banco de dados, connection pooling integrado e cache de borda.

Pontos Principais de Funcionalidade
Autenticação OAuth com GitHub integrada via Auth.js
CRUD completo com Prisma ORM para gerenciamento de posts
Filtro de conteúdo impróprio (profanity filter)
Sistema de seeding de banco de dados com dados de exemplo
Interface responsiva com Tailwind CSS
Middleware de autenticação e autorização
Integração nativa com Prisma Postgres para otimização de produtividade
Stack Tecnológico
Frontend/Backend: Next.js (React framework full-stack)
ORM: Prisma Client e Prisma Postgres
Banco de Dados: PostgreSQL
Autenticação: Auth.js
Estilos: Tailwind CSS
Linguagem: TypeScript (96.8% do código)
Ferramentas: ESLint, PostCSS
Licença
Não especificada no repositório (repositório público do Prisma)

## Notes on Local OAuth (NextAuth)

- When developing locally on a LAN or using a non-`localhost` host (for example `http://192.168.2.101:3000`), make sure the `NEXTAUTH_URL` environment variable in `.env.local` matches the exact origin you use in the browser. Mismatched origins can break PKCE and cause `invalid_grant: Invalid code verifier` errors during OAuth callbacks.

- Make sure the OAuth provider callback URL in the provider console (e.g. Google Cloud Console) includes the exact redirect URI used by NextAuth:

```
http://<your-host>:3000/api/auth/callback/google
```

For example, if you are accessing the app at `http://192.168.2.101:3000`, set:

```
NEXTAUTH_URL=http://192.168.2.101:3000
```

and add the Google redirect URI:

```
http://192.168.2.101:3000/api/auth/callback/google
```

If you prefer using `localhost` make sure to always open `http://localhost:3000` (and set `NEXTAUTH_URL=http://localhost:3000`) when testing OAuth flows.