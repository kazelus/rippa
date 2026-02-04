const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Fix categoryId type
    await prisma.$executeRaw`
      ALTER TABLE "Model" 
      ALTER COLUMN "categoryId" TYPE TEXT;
    `;
    
    console.log('✓ Fixed categoryId column type');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
