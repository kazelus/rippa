const { Pool } = require("pg");
require("dotenv").config();

async function addMissingColumns() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Adding missing columns to ParameterDefinition...");

    await pool.query(
      `ALTER TABLE "ParameterDefinition" ADD COLUMN IF NOT EXISTS "affectsPrice" BOOLEAN DEFAULT false`,
    );
    console.log("✅ Added affectsPrice");

    await pool.query(
      `ALTER TABLE "ParameterDefinition" ADD COLUMN IF NOT EXISTS "priceModifier" DECIMAL(10,2)`,
    );
    console.log("✅ Added priceModifier");

    await pool.query(
      `ALTER TABLE "ParameterDefinition" ADD COLUMN IF NOT EXISTS "priceModifierType" TEXT DEFAULT 'fixed'`,
    );
    console.log("✅ Added priceModifierType");

    await pool.query(
      `ALTER TABLE "ParameterDefinition" ADD COLUMN IF NOT EXISTS "isVariant" BOOLEAN DEFAULT false`,
    );
    console.log("✅ Added isVariant");

    console.log("\n✅ All columns added successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

addMissingColumns();
