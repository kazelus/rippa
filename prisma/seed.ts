import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  try {
    console.log("🌱 Initializing database...");

    // Delete existing admin if any
    await prisma.user.deleteMany({
      where: {
        email: "admin@rippa.pl",
      },
    });

    // Create admin user
    const hashedPassword = await hash("admin123", 10);
    const admin = await prisma.user.create({
      data: {
        email: "admin@rippa.pl",
        password: hashedPassword,
        name: "Admin",
      },
    });

    console.log("✅ Admin created successfully!");
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔐 Password: admin123`);
    console.log(`\n🚀 You can now login at: http://localhost:3000/admin`);

    // Create sample models
    const models = [
      {
        name: "Rippa RE18",
        description:
          "Mała, zwrotna mini-koparka idealna dla prac w ograniczonej przestrzeni",
        power: "16 KM",
        depth: "2.5 m",
        weight: "1.8 t",
        bucket: "0.05 m³",
        price: "Od 45,000 PLN",
        featured: false,
      },
      {
        name: "Rippa RE25",
        description:
          "Najpopularniejszy model z idealnym balansem mocy i ekonomiczności",
        power: "25 KM",
        depth: "2.8 m",
        weight: "2.2 t",
        bucket: "0.06 m³",
        price: "Od 65,000 PLN",
        featured: true,
      },
      {
        name: "Rippa RE35",
        description: "Najmocniejszy model do profesjonalnych prac budowlanych",
        power: "35 KM",
        depth: "3.2 m",
        weight: "3.5 t",
        bucket: "0.08 m³",
        price: "Od 85,000 PLN",
        featured: false,
      },
    ];

    for (const modelData of models) {
      await prisma.model.create({
        data: {
          ...modelData,
          adminId: admin.id,
        },
      });
    }

    console.log("✅ Sample models created!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
