const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Please set DATABASE_URL in .env.local");
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function main() {
  try {
    await pool.connect();
    const res = await pool.query(
      'SELECT id, url, alt, "modelId" FROM "Image" ORDER BY "createdAt" DESC',
    );
    const images = res.rows;
    console.log(`Image rows in DB: ${images.length}`);
    images.forEach((r, i) => {
      console.log(
        `${i + 1}. id=${r.id} url=${r.url} modelId=${r.modelId || ""} alt=${r.alt || ""}`,
      );
    });

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    console.log(`\nFiles in public/uploads: ${files.length}`);
    files.slice(0, 200).forEach((f, i) => console.log(`${i + 1}. ${f}`));

    const dbUrls = new Set(images.map((i) => i.url.replace(/^\//, "")));
    const fileSet = new Set(files);

    const missingFiles = images.filter(
      (i) => !fileSet.has(i.url.replace(/^\//, "")),
    );
    const orphanFiles = files.filter((f) => !dbUrls.has(f));

    console.log(`\nDB images missing on disk: ${missingFiles.length}`);
    missingFiles.forEach((m) => console.log(" -", m.url));

    console.log(`\nFiles on disk without DB record: ${orphanFiles.length}`);
    orphanFiles.slice(0, 200).forEach((f) => console.log(" -", f));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

main();
