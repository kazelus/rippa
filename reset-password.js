const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function resetPassword() {
  const email = "mkolaczynski@protonmail.com";
  const newPassword = "Mikol1170011";
  
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
  
  console.log(`✓ Password reset for ${email}`);
  console.log(`  New password: ${newPassword}`);
  
  await prisma.$disconnect();
}

resetPassword();
