const { Pool } = require("pg");
require("dotenv").config();

async function checkConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log(
      "DATABASE_URL:",
      process.env.DATABASE_URL?.substring(0, 50) + "...",
    );

    const result = await pool.query(
      "SELECT current_database(), current_schema()",
    );
    console.log("Connected to database:", result.rows[0].current_database);
    console.log("Current schema:", result.rows[0].current_schema);

    // Check if migration table exists
    const migrations = await pool.query(`
      SELECT migration_name FROM _prisma_migrations 
      ORDER BY finished_at DESC 
      LIMIT 5
    `);

    console.log("\nLast 5 migrations:");
    migrations.rows.forEach((m) => console.log("  -", m.migration_name));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await pool.end();
  }
}

checkConnection();
