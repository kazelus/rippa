const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

async function addGroupColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Dodawanie kolumny "group" do tabeli "FeatureDefinition"...');

    // Sprawdź czy kolumna już istnieje
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='FeatureDefinition' 
      AND column_name='group';
    `);

    if (checkColumn.rows.length > 0) {
      console.log(
        '✅ Kolumna "group" już istnieje w tabeli "FeatureDefinition"',
      );
    } else {
      // Dodaj kolumnę
      await pool.query(`
        ALTER TABLE "FeatureDefinition" 
        ADD COLUMN "group" TEXT;
      `);
      console.log('✅ Dodano kolumnę "group" do tabeli "FeatureDefinition"');
    }

    // Sprawdź czy kolumna już istnieje w ParameterDefinition
    const checkColumn2 = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='ParameterDefinition' 
      AND column_name='group';
    `);

    if (checkColumn2.rows.length > 0) {
      console.log(
        '✅ Kolumna "group" już istnieje w tabeli "ParameterDefinition"',
      );
    } else {
      // Dodaj kolumnę do ParameterDefinition
      await pool.query(`
        ALTER TABLE "ParameterDefinition" 
        ADD COLUMN "group" TEXT;
      `);
      console.log('✅ Dodano kolumnę "group" do tabeli "ParameterDefinition"');
    }

    console.log("\n✅ Wszystko gotowe!");
  } catch (error) {
    console.error("❌ Błąd:", error);
  } finally {
    await pool.end();
  }
}

addGroupColumn();
