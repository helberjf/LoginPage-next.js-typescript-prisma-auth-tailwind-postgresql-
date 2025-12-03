// auth.ts  (na raiz do projeto)
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./lib/prisma"
import bcrypt from "bcryptjs";

export const {
  handlers,
  signIn,
  signOut,
  auth
} = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },

      async authorize(credentials) {
        // DEBUG logs para ver o que chega
        console.log("[AUTH:authorize] credentials:", credentials);
        console.log("[AUTH:authorize] types:", {
          emailType: typeof credentials?.email,
          passwordType: typeof credentials?.password
        });

        const email =
          typeof credentials?.email === "string"
            ? credentials.email.toLowerCase()
            : undefined;

        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : undefined;

        if (!email || !password) {
          throw new Error(
            "Credenciais inválidas: email e senha devem ser strings."
          );
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error("Email ou senha incorretos.");
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          throw new Error("Email ou senha incorretos.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image ?? null,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },
});
