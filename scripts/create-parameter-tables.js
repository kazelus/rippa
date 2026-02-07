const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    "postgresql://rippa_user:TwojeHaslo@localhost:5432/rippa_polska",
});

async function createParameterTables() {
  try {
    // Create ParameterDefinition table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "ParameterDefinition" (
        "id" TEXT NOT NULL,
        "categoryId" TEXT,
        "key" TEXT NOT NULL,
        "label" TEXT NOT NULL,
        "unit" TEXT,
        "type" TEXT NOT NULL,
        "options" JSONB,
        "required" BOOLEAN NOT NULL DEFAULT false,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "ParameterDefinition_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("✓ Created ParameterDefinition table");

    // Create ProductParameterValue table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "ProductParameterValue" (
        "id" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "parameterId" TEXT NOT NULL,
        "value" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "ProductParameterValue_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("✓ Created ProductParameterValue table");

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "ParameterDefinition_categoryId_idx" ON "ParameterDefinition"("categoryId");
    `);
    console.log("✓ Created index on ParameterDefinition.categoryId");

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ParameterDefinition_categoryId_key_key" ON "ParameterDefinition"("categoryId", "key");
    `);
    console.log(
      "✓ Created unique index on ParameterDefinition (categoryId, key)",
    );

    await pool.query(`
      CREATE INDEX IF NOT EXISTS "ProductParameterValue_productId_idx" ON "ProductParameterValue"("productId");
    `);
    console.log("✓ Created index on ProductParameterValue.productId");

    await pool.query(`
      CREATE INDEX IF NOT EXISTS "ProductParameterValue_parameterId_idx" ON "ProductParameterValue"("parameterId");
    `);
    console.log("✓ Created index on ProductParameterValue.parameterId");

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ProductParameterValue_productId_parameterId_key" ON "ProductParameterValue"("productId", "parameterId");
    `);
    console.log(
      "✓ Created unique index on ProductParameterValue (productId, parameterId)",
    );

    // Add foreign keys
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'ParameterDefinition_categoryId_fkey'
        ) THEN
          ALTER TABLE "ParameterDefinition" 
          ADD CONSTRAINT "ParameterDefinition_categoryId_fkey" 
          FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    console.log("✓ Added foreign key ParameterDefinition -> Category");

    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'ProductParameterValue_productId_fkey'
        ) THEN
          ALTER TABLE "ProductParameterValue" 
          ADD CONSTRAINT "ProductParameterValue_productId_fkey" 
          FOREIGN KEY ("productId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    console.log("✓ Added foreign key ProductParameterValue -> Model");

    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'ProductParameterValue_parameterId_fkey'
        ) THEN
          ALTER TABLE "ProductParameterValue" 
          ADD CONSTRAINT "ProductParameterValue_parameterId_fkey" 
          FOREIGN KEY ("parameterId") REFERENCES "ParameterDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    console.log(
      "✓ Added foreign key ProductParameterValue -> ParameterDefinition",
    );

    console.log("\n✅ All parameter tables created successfully!");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

createParameterTables();
