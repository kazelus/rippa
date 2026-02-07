// Skrypt do aktualizacji grup parametrów
// Uruchom: node scripts/update-parameter-groups.js

const { Pool } = require("pg");

async function updateParameterGroups() {
  // Pobierz DATABASE_URL z pliku .env.local
  require("dotenv").config({ path: ".env.local" });

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Przykładowe mapowanie parametrów na grupy
    const groupMappings = {
      Silnik: ["moc", "silnik", "power", "engine", "paliwo", "fuel"],
      Wymiary: [
        "głębokość",
        "depth",
        "wysokość",
        "height",
        "szerokość",
        "width",
        "długość",
        "length",
        "masa",
        "weight",
        "waga",
      ],
      Hydraulika: [
        "pojemność",
        "bucket",
        "hydrauli",
        "ciśnienie",
        "pressure",
        "pompę",
        "pump",
      ],
      Podwozie: ["prędkość", "speed", "gąsienice", "track", "opony", "tire"],
    };

    console.log("=== Aktualizacja grup parametrów ===\n");

    for (const [groupName, keywords] of Object.entries(groupMappings)) {
      console.log(`\n📁 Grupa: ${groupName}`);

      for (const keyword of keywords) {
        const result = await pool.query(
          `UPDATE "ParameterDefinition" 
           SET "group" = $1 
           WHERE (LOWER(label) LIKE $2 OR LOWER(key) LIKE $2) 
           AND "group" IS NULL`,
          [groupName, `%${keyword.toLowerCase()}%`],
        );

        if (result.rowCount > 0) {
          console.log(
            `   ✅ Zaktualizowano ${result.rowCount} parametr(ów) zawierających "${keyword}"`,
          );
        }
      }
    }

    // Sprawdź ile parametrów nie ma grupy
    const nullGroupCount = await pool.query(
      'SELECT COUNT(*) as count FROM "ParameterDefinition" WHERE "group" IS NULL',
    );

    console.log(`\n⚠️  Parametrów bez grupy: ${nullGroupCount.rows[0].count}`);
    console.log('   (zostaną wyświetlone w grupie "Ogólne")\n');

    // Pokaż statystyki
    const stats = await pool.query(
      'SELECT "group", COUNT(*) as count FROM "ParameterDefinition" GROUP BY "group" ORDER BY count DESC',
    );

    console.log("=== Statystyki grup ===");
    stats.rows.forEach((row) => {
      console.log(`${row.group || "Ogólne (NULL)"}: ${row.count} parametrów`);
    });
  } catch (error) {
    console.error("❌ Błąd:", error.message);
  } finally {
    await pool.end();
  }
}

updateParameterGroups();
