import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
    {
      firstName: "Alice",
      lastName: "Silva",
      name: "Alice Silva",
      email: "alice@example.com",
      password: "$2b$10$123456789012345678901uQeP9sZC4rJHf", // hash fake
    },
    {
      firstName: "Bob",
      lastName: "Souza",
      name: "Bob Souza",
      email: "bob@example.com",
      password: "$2b$10$abcdefghijk123456789012345678901234", // hash fake
    },
  ];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();