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

    console.log("✅ Database tables initialized");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}
