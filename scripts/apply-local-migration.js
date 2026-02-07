// Apply the price_variants_system migration manually to local database
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

async function applyMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log(
      "Connecting to:",
      process.env.DATABASE_URL?.substring(0, 60) + "...",
    );

    // 1. Add columns to FeatureDefinition (IF NOT EXISTS to avoid errors)
    console.log("\n1. Adding columns to FeatureDefinition...");
    try {
      await pool.query(
        `ALTER TABLE "FeatureDefinition" ADD COLUMN IF NOT EXISTS "affectsPrice" BOOLEAN NOT NULL DEFAULT false`,
      );
      console.log("   ✅ affectsPrice");
    } catch (e) {
      console.log("   ⚠️ affectsPrice already exists");
    }

    try {
      await pool.query(
        `ALTER TABLE "FeatureDefinition" ADD COLUMN IF NOT EXISTS "isVariant" BOOLEAN NOT NULL DEFAULT false`,
      );
      console.log("   ✅ isVariant");
    } catch (e) {
      console.log("   ⚠️ isVariant already exists");
    }

    try {
      await pool.query(
        `ALTER TABLE "FeatureDefinition" ADD COLUMN IF NOT EXISTS "priceModifier" DECIMAL(10,2)`,
      );
      console.log("   ✅ priceModifier");
    } catch (e) {
      console.log("   ⚠️ priceModifier already exists");
    }

    try {
      await pool.query(
        `ALTER TABLE "FeatureDefinition" ADD COLUMN IF NOT EXISTS "priceModifierType" TEXT DEFAULT 'fixed'`,
      );
      console.log("   ✅ priceModifierType");
    } catch (e) {
      console.log("   ⚠️ priceModifierType already exists");
    }

    // 2. Create ParameterDefinition table
    console.log("\n2. Creating ParameterDefinition table...");
    await pool.query(`DROP TABLE IF EXISTS "ProductParameterValue" CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS "ParameterDefinition" CASCADE`);

    await pool.query(`
      CREATE TABLE "ParameterDefinition" (
        "id" TEXT NOT NULL,
        "categoryId" TEXT,
        "key" TEXT NOT NULL,
        "label" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "unit" TEXT,
        "options" JSONB,
        "required" BOOLEAN NOT NULL DEFAULT false,
        "order" INTEGER NOT NULL DEFAULT 0,
        "group" TEXT,
        "affectsPrice" BOOLEAN NOT NULL DEFAULT false,
        "priceModifier" DECIMAL(10,2),
        "priceModifierType" TEXT DEFAULT 'fixed',
        "isVariant" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "ParameterDefinition_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log("   ✅ ParameterDefinition created");

    // 3. Create indexes
    console.log("\n3. Creating indexes...");
    await pool.query(
      `CREATE INDEX "ParameterDefinition_categoryId_idx" ON "ParameterDefinition"("categoryId")`,
    );
    await pool.query(
      `CREATE UNIQUE INDEX "ParameterDefinition_categoryId_key_key" ON "ParameterDefinition"("categoryId", "key")`,
    );
    console.log("   ✅ Indexes created");

    // 4. Create ProductParameterValue table
    console.log("\n4. Creating ProductParameterValue table...");
    await pool.query(`
      CREATE TABLE "ProductParameterValue" (
        "id" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "parameterId" TEXT NOT NULL,
        "value" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "ProductParameterValue_pkey" PRIMARY KEY ("id")
      )
    `);

    await pool.query(
      `CREATE INDEX "ProductParameterValue_productId_idx" ON "ProductParameterValue"("productId")`,
    );
    await pool.query(
      `CREATE INDEX "ProductParameterValue_parameterId_idx" ON "ProductParameterValue"("parameterId")`,
    );
    await pool.query(
      `CREATE UNIQUE INDEX "ProductParameterValue_productId_parameterId_key" ON "ProductParameterValue"("productId", "parameterId")`,
    );
    await pool.query(
      `ALTER TABLE "ProductParameterValue" ADD CONSTRAINT "ProductParameterValue_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "ParameterDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    console.log("   ✅ ProductParameterValue created");

    // 5. Verify
    console.log("\n5. Verifying...");
    const cols = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'ParameterDefinition' ORDER BY ordinal_position
    `);
    console.log(
      "   ParameterDefinition columns:",
      cols.rows.map((r) => r.column_name).join(", "),
    );

    console.log("\n✅ Migration applied successfully to LOCAL database!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

applyMigration();
