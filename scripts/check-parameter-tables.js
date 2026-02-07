const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    "postgresql://rippa_user:TwojeHaslo@localhost:5432/rippa_polska",
});

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%Parameter%'
      ORDER BY table_name;
    `);

    console.log('Tables with "Parameter" in name:');
    result.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    if (result.rows.length === 0) {
      console.log("  (none found)");
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

checkTables();
