const { Pool } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

// Load .env.local if present
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "Please set DATABASE_URL in the environment or .env.local before running this script.",
  );
  process.exit(1);
}

const pool = new Pool({ connectionString });

// List of missing URLs identified earlier
const missingUrls = [
  "/uploads/1769217501964-m4wgpdd-03.jpg",
  "/uploads/1769217495670-kyg17pp-01.jpg",
  "/uploads/1769217487902-abk3zsu-00.jpg",
  "/uploads/1769218839951-slzdloe-03.png",
  "/uploads/1769256415512-ftnlsx8-03.png",
  "/uploads/1769256405767-ae0pwfa-04(4).jpg",
  "/uploads/1769256405668-mwlq51m-03(9).jpg",
  "/uploads/1769256405597-13q49x6-02(3).jpg",
  "/uploads/1769256405536-d3uf06i-01(7).jpg",
];

async function main() {
  try {
    console.log("Connecting to DB...");
    await pool.connect();

    for (const url of missingUrls) {
      console.log("\nProcessing:", url);

      // Find image records
      const res = await pool.query(
        'SELECT id, url, "modelId" FROM "Image" WHERE url = $1',
        [url],
      );
      if (res.rows.length === 0) {
        console.log("  No Image record found for", url);
        // Still update models that reference it in heroImageId
        const upd = await pool.query(
          'UPDATE "Model" SET "heroImageId" = NULL WHERE "heroImageId" = $1 RETURNING id',
          [url],
        );
        if (upd.rowCount > 0)
          console.log(`  Cleared heroImageId on ${upd.rowCount} model(s)`);
        continue;
      }

      // Delete image records
      const ids = res.rows.map((r) => r.id);
      const del = await pool.query(
        'DELETE FROM "Image" WHERE url = $1 RETURNING id',
        [url],
      );
      console.log(`  Deleted ${del.rowCount} Image record(s):`, ids.join(", "));

      // Clear heroImageId in models referencing this URL
      const upd = await pool.query(
        'UPDATE "Model" SET "heroImageId" = NULL WHERE "heroImageId" = $1 RETURNING id',
        [url],
      );
      if (upd.rowCount > 0)
        console.log(`  Cleared heroImageId on ${upd.rowCount} model(s)`);
    }

    console.log("\nDone.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

main();
