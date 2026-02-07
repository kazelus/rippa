const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    "postgresql://rippa_user:TwojeHaslo@localhost:5432/rippa_polska",
});

async function checkAllTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("All tables in database:");
    result.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

checkAllTables();
