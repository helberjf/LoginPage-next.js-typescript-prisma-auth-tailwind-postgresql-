/* auth.ts */

import NextAuth, { type NextAuthConfig, CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/auth/validation";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),

  logger: {
    error(code, ...message) {
      if (code instanceof CredentialsSignin || code.name === "CredentialsSignin") return;
      console.error(code, ...message);
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      name: "credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials) return null;

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            accounts: {
              where: { provider: "google" },
              select: { id: true },
            },
          },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(
          password,
          user.password
        );

        if (!passwordMatch) return null;

        const isVerified = Boolean(user.emailVerified) || user.accounts.length > 0;
        if (!isVerified) {
          class EmailNotVerifiedError extends CredentialsSignin {
            code = "email_not_verified";
          }
          throw new EmailNotVerifiedError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // vem do banco
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "CUSTOMER";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CUSTOMER";
      }
      return session;
    },
  },
};

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);
