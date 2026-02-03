import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.query(`
      SELECT id, name, slug, description, "createdAt", "updatedAt" 
      FROM "Category" 
      ORDER BY "createdAt" DESC
    `);
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description } = await req.json();

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Get user ID
    const userResult = await db.query(
      `SELECT id FROM "User" WHERE email = $1`,
      [session.user.email],
    );

    if (userResult.rows.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult.rows[0].id;

    // Check if slug already exists
    const existingCategory = await db.query(
      `SELECT id FROM "Category" WHERE slug = $1`,
      [slug],
    );

    if (existingCategory.rows.length > 0) {
      return Response.json(
        { error: "Category with this name already exists" },
        { status: 409 },
      );
    }

    // Create category
    const result = await db.query(
      `INSERT INTO "Category" (id, name, slug, description, "adminId", "createdAt", "updatedAt") 
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW()) 
       RETURNING id, name, slug, description, "createdAt", "updatedAt"`,
      [name, slug, description || null, userId],
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return Response.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
