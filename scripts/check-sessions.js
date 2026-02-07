const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkSessions() {
  try {
    const result = await pool.query(
      'SELECT * FROM "Session" ORDER BY expires DESC LIMIT 10',
    );
    console.log("Recent sessions:");
    console.table(result.rows);

    const userResult = await pool.query('SELECT id, email FROM "User"');
    console.log("\nUsers:");
    console.table(userResult.rows);

    await pool.end();
  } catch (error) {
    console.error("Error:", error);
    await pool.end();
  }
}

checkSessions();
