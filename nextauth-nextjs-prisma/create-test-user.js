// Test script to create a user with known password
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    console.log('Creating test user...');

    // Hash a known password
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('Hashed password:', hashedPassword);

    // Create or update test user
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Test User'
      },
      create: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User'
      }
    });

    console.log('✅ Test user created/updated:', user.email);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

createTestUser();