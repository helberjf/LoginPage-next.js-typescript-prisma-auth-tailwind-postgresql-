// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const client = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") global.__prisma = client;

export default client;
