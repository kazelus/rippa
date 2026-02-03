const { Pool } = require("pg");

// Use sales_user to connect directly to sales_saas database
const dbPool = new Pool({
  user: "sales_user",
  password: "Mikol1170011",
  host: "localhost",
  port: 5432,
  database: "sales_saas",
});

async function setupDatabase() {
  try {
    console.log("🔄 Connecting to PostgreSQL (sales_saas)...");
    const dbClient = await dbPool.connect();

    // Create User table
    await dbClient.query(`
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
    console.log("✅ User table created");

    // Create Category table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS "Category" (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        "adminId" VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Category table created");

    // Create Model table
    await dbClient.query(`
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
        "categoryId" VARCHAR(255),
        "adminId" VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Model table created");

    // Add categoryId column if it doesn't exist (for existing databases)
    try {
      await dbClient.query(`
        ALTER TABLE "Model" ADD COLUMN IF NOT EXISTS "categoryId" VARCHAR(255)
      `);
      console.log("✅ categoryId column ensured");
    } catch (e) {
      // Column might already exist
    }

    // Create Image table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS "Image" (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        url VARCHAR(255) NOT NULL,
        alt VARCHAR(255),
        "modelId" VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Image table created");

    console.log("\n✅ All tables created successfully in sales_saas!");
    console.log(
      "🚀 Now you can register and login at http://localhost:3000/admin",
    );

    dbClient.release();
    await dbPool.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setupDatabase();
