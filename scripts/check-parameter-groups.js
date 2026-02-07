const { Pool } = require("pg");

async function checkParameterGroups() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query(
      'SELECT id, label, "group" FROM "ParameterDefinition" ORDER BY label LIMIT 20',
    );

    console.log("\n=== Parametry w bazie danych ===\n");
    console.log("ID | Label | Group");
    console.log("-".repeat(80));

    result.rows.forEach((row) => {
      console.log(
        `${row.id.substring(0, 8)}... | ${row.label} | ${row.group || "NULL (Ogólne)"}`,
      );
    });

    console.log("\n=== Statystyki ===");
    const statsResult = await pool.query(
      'SELECT "group", COUNT(*) as count FROM "ParameterDefinition" GROUP BY "group" ORDER BY count DESC',
    );

    console.log("\nGrupa | Ilość");
    console.log("-".repeat(40));
    statsResult.rows.forEach((row) => {
      console.log(`${row.group || "NULL (Ogólne)"} | ${row.count}`);
    });
  } catch (error) {
    console.error("Błąd:", error.message);
  } finally {
    await pool.end();
  }
}

checkParameterGroups();
