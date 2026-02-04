const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fixSMTP() {
  await prisma.settings.upsert({
    where: { key: "smtp_secure" },
    update: { value: "false" },
    create: { key: "smtp_secure", value: "false" },
  });
  
  console.log("✓ Fixed smtp_secure to false for port 587");
  
  await prisma.$disconnect();
}

fixSMTP();
