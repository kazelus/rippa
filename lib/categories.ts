import { db } from "@/lib/db";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export async function getCategories(): Promise<Category[]> {
  const result = await db.query(`
    SELECT id, name, slug, description, "createdAt", "updatedAt" 
    FROM "Category" 
    ORDER BY "createdAt" DESC
  `);
  return result.rows;
}
