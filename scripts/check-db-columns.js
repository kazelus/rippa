const { Pool } = require("pg");
require("dotenv").config();

async function checkColumns() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check ParameterDefinition table existence and columns
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ParameterDefinition'
      );
    `);

    console.log(
      "ParameterDefinition table exists:",
      tableExists.rows[0].exists,
    );

    if (tableExists.rows[0].exists) {
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'ParameterDefinition'
        ORDER BY ordinal_position;
      `);

      console.log("\nParameterDefinition columns:");
      columns.rows.forEach((col) => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }

    // Check FeatureDefinition columns
    const featureColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'FeatureDefinition'
      ORDER BY ordinal_position;
    `);

    console.log("\nFeatureDefinition columns:");
    featureColumns.rows.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}

checkColumns();
