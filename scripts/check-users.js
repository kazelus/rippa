const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, email, name FROM "User"');
    console.log("Users in database:");
    console.table(result.rows);
    await pool.end();
  } catch (error) {
    console.error("Error:", error);
    await pool.end();
  }
}

checkUsers();
