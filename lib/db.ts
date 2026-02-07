import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = pool;

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        "emailVerified" TIMESTAMP,
        password VARCHAR(255),
        image VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS "Category" (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        "adminId" VARCHAR(255) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create models table
    await db.query(`
      CREATE TABLE IF NOT EXISTS "Model" (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        power VARCHAR(255) NOT NULL,
        depth VARCHAR(255) NOT NULL,
        weight VARCHAR(255) NOT NULL,
        bucket VARCHAR(255) NOT NULL,
        price VARCHAR(255) NOT NULL,
        featured BOOLEAN DEFAULT false,
        visible BOOLEAN DEFAULT true,
        "categoryId" VARCHAR(255) REFERENCES "Category"(id) ON DELETE SET NULL,
        "adminId" VARCHAR(255) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add categoryId column if it doesn't exist
    try {
      await db.query(`
        ALTER TABLE "Model" ADD COLUMN IF NOT EXISTS "categoryId" VARCHAR(255) REFERENCES "Category"(id) ON DELETE SET NULL
      `);
    } catch (e) {
      // Column might already exist
    }

    // Add visible column if it doesn't exist
    try {
      await db.query(`
        ALTER TABLE "Model" ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true
      `);
    } catch (e) {
      // Column might already exist
    }

    // Create images table
    await db.query(`
      CREATE TABLE IF NOT EXISTS "Image" (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        url VARCHAR(255) NOT NULL,
        alt VARCHAR(255),
        "modelId" VARCHAR(255) NOT NULL REFERENCES "Model"(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create feature definitions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS "FeatureDefinition" (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "categoryId" VARCHAR(255) REFERENCES "Category"(id) ON DELETE CASCADE,
        key VARCHAR(255) NOT NULL,
        label VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        options JSONB,
        required BOOLEAN DEFAULT false,
        "order" INT DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns for variant pricing system if they don't exist
    try {
      await db.query(
        `ALTER TABLE "FeatureDefinition" ADD COLUMN IF NOT EXISTS "group" TEXT`,
      );
      await db.query(
        `ALTER TABLE "FeatureDefinition" ADD COLUMN IF NOT EXISTS "affectsPrice" BOOLEAN DEFAULT false`,
      );
      await db.query(
        `ALTER TABLE "FeatureDefinition" ADD COLUMN IF NOT EXISTS "priceModifier" DECIMAL(10,2)`,
      );
      await db.query(
        `ALTER TABLE "FeatureDefinition" ADD COLUMN IF NOT EXISTS "priceModifierType" TEXT DEFAULT 'fixed'`,
      );
      await db.query(
        `ALTER TABLE "FeatureDefinition" ADD COLUMN IF NOT EXISTS "isVariant" BOOLEAN DEFAULT false`,
      );
      await db.query(
        `ALTER TABLE "FeatureDefinition" ADD COLUMN IF NOT EXISTS "variantOptions" JSONB`,
      );
    } catch (e) {
      // Columns might already exist
    }

    // Create product feature values table
    await db.query(`
      CREATE TABLE IF NOT EXISTS "ProductFeatureValue" (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "productId" VARCHAR(255) NOT NULL REFERENCES "Model"(id) ON DELETE CASCADE,
        "featureId" VARCHAR(255) NOT NULL REFERENCES "FeatureDefinition"(id) ON DELETE CASCADE,
        value JSONB,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE ("productId", "featureId")
      )
    `);

    // NOTE: ParameterDefinition and ProductParameterValue are managed by Prisma migrations
    // Do not create them here to avoid conflicts with migration schema

    // Add quickSpec columns to ParameterDefinition if they don't exist
    try {
      await db.query(
        `ALTER TABLE "ParameterDefinition" ADD COLUMN IF NOT EXISTS "variantOptions" JSONB`,
      );
      await db.query(
        `ALTER TABLE "ParameterDefinition" ADD COLUMN IF NOT EXISTS "isQuickSpec" BOOLEAN DEFAULT false`,
      );
      await db.query(
        `ALTER TABLE "ParameterDefinition" ADD COLUMN IF NOT EXISTS "quickSpecOrder" INT DEFAULT 0`,
      );
      await db.query(
        `ALTER TABLE "ParameterDefinition" ADD COLUMN IF NOT EXISTS "quickSpecLabel" VARCHAR(100)`,
      );
    } catch (e) {
      // Columns might already exist
    }

    // ===== MODEL VARIANT SYSTEM =====
    // Variant groups (e.g. "Kabina", "Silnik")
    await db.query(`
      CREATE TABLE IF NOT EXISTS "ModelVariantGroup" (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "modelId" VARCHAR(255) NOT NULL REFERENCES "Model"(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        "order" INT DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Variant options (e.g. "Kabina podstawowa", "Kabina komfort", "Kabina premium")
    await db.query(`
      CREATE TABLE IF NOT EXISTS "ModelVariantOption" (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "groupId" VARCHAR(255) NOT NULL REFERENCES "ModelVariantGroup"(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        "priceModifier" DOUBLE PRECISION DEFAULT 0,
        "isDefault" BOOLEAN DEFAULT false,
        images JSONB,
        "parameterOverrides" JSONB,
        "order" INT DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ===== MODEL ACCESSORIES (model-to-model links) =====
    await db.query(`
      CREATE TABLE IF NOT EXISTS "ModelAccessory" (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "parentModelId" VARCHAR(255) NOT NULL REFERENCES "Model"(id) ON DELETE CASCADE,
        "accessoryModelId" VARCHAR(255) NOT NULL REFERENCES "Model"(id) ON DELETE CASCADE,
        UNIQUE ("parentModelId", "accessoryModelId")
      )
    `);
    try {
      await db.query(
        `CREATE INDEX IF NOT EXISTS "ModelAccessory_parentModelId_idx" ON "ModelAccessory" ("parentModelId")`,
      );
      await db.query(
        `CREATE INDEX IF NOT EXISTS "ModelAccessory_accessoryModelId_idx" ON "ModelAccessory" ("accessoryModelId")`,
      );
    } catch (e) {
      /* indexes may already exist */
    }

    // Drop old Accessory tables if they exist (migrated to ModelAccessory)
    try {
      await db.query(`DROP TABLE IF EXISTS "AccessoryModel" CASCADE`);
      await db.query(`DROP TABLE IF EXISTS "Accessory" CASCADE`);
    } catch (e) {
      /* ignore */
    }

    // ===== SECTION TEMPLATES =====
    await db.query(`
      CREATE TABLE IF NOT EXISTS "SectionTemplate" (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        text TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Database tables initialized");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}
