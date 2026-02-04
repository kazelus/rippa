const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      password: true,
    },
  });
  
  console.log("Users in production database:");
  users.forEach(u => {
    console.log(`- Email: ${u.email}, Name: ${u.name}, Has password: ${!!u.password}`);
  });
  
  await prisma.$disconnect();
}

checkUsers();
