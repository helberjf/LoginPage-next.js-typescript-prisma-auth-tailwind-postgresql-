import { PrismaClient } from './app/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function createUser() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('Creating user with password hash:', hashedPassword);

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User'
      }
    });

    console.log('✅ User created:', user.email);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();