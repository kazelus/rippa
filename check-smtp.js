const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkSMTP() {
  const keys = [
    "smtp_host",
    "smtp_port",
    "smtp_user",
    "smtp_secure",
    "smtp_from",
    "contact_emails",
  ];

  const settings = await prisma.settings.findMany({
    where: { key: { in: keys } },
  });

  console.log("Current SMTP settings:");
  settings.forEach((s) => {
    console.log(`  ${s.key}: ${s.value}`);
  });

  await prisma.$disconnect();
}

checkSMTP();
