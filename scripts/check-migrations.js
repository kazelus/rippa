const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  try {
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at, applied_steps_count
      FROM "_prisma_migrations"
      ORDER BY finished_at DESC;
    `;

    console.log("Applied migrations in database:");
    migrations.forEach((m) => {
      console.log(`- ${m.migration_name} (${m.applied_steps_count} steps)`);
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
