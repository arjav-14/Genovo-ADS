const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
});

async function updateCredits() {
  try {
    const result = await prisma.$executeRaw`UPDATE "User" SET "credits" = 20 WHERE "credits" = 10`;
    console.log('Update result:', result);
    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
}

updateCredits();
