const { Pool } = require("pg");
require("dotenv").config();

async function testQuery() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Test exact query from API
    const query =
      'SELECT id, "categoryId", key, label, unit, type, options, required, "order", "group", "affectsPrice", "priceModifier", "priceModifierType", "isVariant", "createdAt", "updatedAt" FROM "ParameterDefinition" ORDER BY "order" ASC';

    console.log("Executing query...");
    const result = await pool.query(query);
    console.log("✅ Query successful!");
    console.log("Rows returned:", result.rows.length);
    if (result.rows.length > 0) {
      console.log("First row:", result.rows[0]);
    }
  } catch (error) {
    console.error("❌ Query failed:", error.message);
    console.error("Error code:", error.code);
  } finally {
    await pool.end();
  }
}

testQuery();
