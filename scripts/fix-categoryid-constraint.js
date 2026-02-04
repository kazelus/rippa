const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Drop existing constraint if exists
    await prisma.$executeRaw`
      ALTER TABLE "Model" 
      DROP CONSTRAINT IF EXISTS "Model_categoryId_fkey";
    `;
    
    // Drop existing index if exists  
    await prisma.$executeRaw`
      DROP INDEX IF EXISTS "Model_categoryId_idx";
    `;
    
    // Add new index
    await prisma.$executeRaw`
      CREATE INDEX "Model_categoryId_idx" ON "Model"("categoryId");
    `;
    
    // Add new foreign key with correct ON DELETE behavior
    await prisma.$executeRaw`
      ALTER TABLE "Model" 
      ADD CONSTRAINT "Model_categoryId_fkey" 
      FOREIGN KEY ("categoryId") REFERENCES "Category"("id") 
      ON DELETE SET NULL ON UPDATE CASCADE;
    `;
    
    console.log('✓ Fixed Model categoryId foreign key and index');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
