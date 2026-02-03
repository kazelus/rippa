import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "mkolaczynski@protonmail.com";
  const password = "Mikol1170011";

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log(`Admin user ${email} already exists`);
    return;
  }

  // Hash password (bcryptjs)
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email,
      name: "Administrator",
      password: hashedPassword,
    },
  });

  console.log(`✓ Admin user created: ${admin.email}`);
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
