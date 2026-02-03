const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "Please set DATABASE_URL in the environment before running this script.",
  );
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function main() {
  try {
    const res = await pool.query('SELECT url FROM "Image"');
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const missing = [];
    for (const row of res.rows) {
      const url = row.url || "";
      if (!url.startsWith("/uploads/")) continue;
      const filename = url.replace("/uploads/", "");
      const filepath = path.join(uploadsDir, filename);
      if (!fs.existsSync(filepath)) {
        missing.push({ url, filename });
      }
    }

    if (missing.length === 0) {
      console.log("All image files exist on disk.");
    } else {
      console.log("Missing files:");
      missing.forEach((m) => console.log(`- ${m.url}`));
      console.log(`Total missing: ${missing.length}`);
    }
  } catch (err) {
    console.error("Error checking uploads:", err);
  } finally {
    await pool.end();
  }
}

main();
