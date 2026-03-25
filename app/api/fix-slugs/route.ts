import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

function generateSlug(name: string): string {
  if (!name) return "";
  const polishChars = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'a', 'Ć': 'c', 'Ę': 'e', 'Ł': 'l', 'Ń': 'n', 'Ó': 'o', 'Ś': 's', 'Ź': 'z', 'Ż': 'z'
  };
  let slug = name.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, match => polishChars[match as keyof typeof polishChars]);
  slug = slug.toLowerCase();
  slug = slug.replace(/[\s_]+/g, '-');
  slug = slug.replace(/[^\w-]/g, '');
  slug = slug.replace(/-+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');
  return slug;
}

export async function GET() {
  try {
    const modelsResult = await pool.query('SELECT id, name FROM "Model" WHERE slug IS NULL OR slug = \'\'');
    const models = modelsResult.rows;
    let updatedCount = 0;

    for (const model of models) {
      if (!model.name) continue;
      
      let baseSlug = generateSlug(model.name);
      let uniqueSlug = baseSlug;
      let suffix = 1;
      
      while (true) {
        const check = await pool.query('SELECT id FROM "Model" WHERE slug = $1 AND id != $2', [uniqueSlug, model.id]);
        if (check.rowCount === 0) {
          break;
        }
        uniqueSlug = `${baseSlug}-${suffix}`;
        suffix++;
      }

      await pool.query('UPDATE "Model" SET slug = $1 WHERE id = $2', [uniqueSlug, model.id]);
      updatedCount++;
    }

    return NextResponse.json({ 
        message: `Pomyślnie zaktualizowano ${updatedCount} modeli (w tym akcesoriów) bez przyjaznych linków.`,
        updated: updatedCount
    });
  } catch (error: any) {
    console.error("Błąd podczas naprawiania slugów:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
