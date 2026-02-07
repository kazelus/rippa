// Script to add variantOptions JSONB column to both FeatureDefinition and ParameterDefinition
// Run with: node scripts/add-variant-options-column.js
// Uses .env.local (local DB)

const { Pool } = require("pg");
const fs = require("fs");

// Read .env.local
const envContent = fs.readFileSync(".env.local", "utf-8");
const match = envContent.match(/^DATABASE_URL="?([^"\n]*)"?/m);
if (!match) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const pool = new Pool({ connectionString: match[1] });

async function main() {
  const client = await pool.connect();
  try {
    console.log("Adding variantOptions column to FeatureDefinition...");
    await client.query(
      `ALTER TABLE "FeatureDefinition" ADD COLUMN IF NOT EXISTS "variantOptions" JSONB`,
    );
    console.log("✅ FeatureDefinition updated");

    console.log("Adding variantOptions column to ParameterDefinition...");
    await client.query(
      `ALTER TABLE "ParameterDefinition" ADD COLUMN IF NOT EXISTS "variantOptions" JSONB`,
    );
    console.log("✅ ParameterDefinition updated");

    // Verify
    const res1 = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'FeatureDefinition' AND column_name = 'variantOptions'`,
    );
    const res2 = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'ParameterDefinition' AND column_name = 'variantOptions'`,
    );
    console.log(`\nVerification:`);
    console.log(
      `  FeatureDefinition.variantOptions: ${res1.rows.length > 0 ? "✅ exists" : "❌ missing"}`,
    );
    console.log(
      `  ParameterDefinition.variantOptions: ${res2.rows.length > 0 ? "✅ exists" : "❌ missing"}`,
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
