require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    await client.query('ALTER TABLE "Model" ADD COLUMN IF NOT EXISTS "availability" TEXT DEFAULT \'Dostępne od ręki\'');
    console.log('Success adding availability');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
