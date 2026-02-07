const { Pool } = require("pg");
require("dotenv").config();

async function recreateTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Dropping ParameterDefinition table...");
    await pool.query(`DROP TABLE IF EXISTS "ProductParameterValue" CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS "ParameterDefinition" CASCADE`);
    console.log("✅ Tables dropped");

    console.log("\nRecreating ParameterDefinition with all columns...");
    await pool.query(`
      CREATE TABLE "ParameterDefinition" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "categoryId" TEXT REFERENCES "Category"(id) ON DELETE CASCADE,
        key TEXT NOT NULL,
        label TEXT NOT NULL,
        type TEXT NOT NULL,
        unit TEXT,
        options JSONB,
        required BOOLEAN NOT NULL DEFAULT false,
        "order" INTEGER NOT NULL DEFAULT 0,
        "group" TEXT,
        "affectsPrice" BOOLEAN NOT NULL DEFAULT false,
        "priceModifier" DECIMAL(10,2),
        "priceModifierType" TEXT DEFAULT 'fixed',
        "isVariant" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ ParameterDefinition created");

    await pool.query(
      `CREATE INDEX "ParameterDefinition_categoryId_idx" ON "ParameterDefinition"("categoryId")`,
    );
    await pool.query(
      `CREATE UNIQUE INDEX "ParameterDefinition_categoryId_key_key" ON "ParameterDefinition"("categoryId", "key")`,
    );
    console.log("✅ Indexes created");

    console.log("\nRecreating ProductParameterValue...");
    await pool.query(`
      CREATE TABLE "ProductParameterValue" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "productId" TEXT NOT NULL REFERENCES "Model"(id) ON DELETE CASCADE,
        "parameterId" TEXT NOT NULL REFERENCES "ParameterDefinition"(id) ON DELETE CASCADE,
        value JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE ("productId", "parameterId")
      )
    `);

    await pool.query(
      `CREATE INDEX "ProductParameterValue_productId_idx" ON "ProductParameterValue"("productId")`,
    );
    await pool.query(
      `CREATE INDEX "ProductParameterValue_parameterId_idx" ON "ProductParameterValue"("parameterId")`,
    );
    console.log("✅ ProductParameterValue created");

    console.log("\n✅ All tables recreated successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

recreateTable();
