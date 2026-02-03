import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await db.query(
      `SELECT id, name, slug, description, "createdAt", "updatedAt" 
       FROM "Category" 
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching category:", error);
    return Response.json(
      { error: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { name, description } = await req.json();

    // Verify ownership
    const categoryResult = await db.query(
      `SELECT "adminId" FROM "Category" WHERE id = $1`,
      [id],
    );

    if (categoryResult.rows.length === 0) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    const userResult = await db.query(
      `SELECT id FROM "User" WHERE email = $1`,
      [session.user.email],
    );

    if (categoryResult.rows[0].adminId !== userResult.rows[0].id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const result = await db.query(
      `UPDATE "Category" 
       SET name = $1, slug = $2, description = $3, "updatedAt" = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING id, name, slug, description, "createdAt", "updatedAt"`,
      [name, slug, description || null, id],
    );

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating category:", error);
    return Response.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Verify ownership
    const categoryResult = await db.query(
      `SELECT "adminId" FROM "Category" WHERE id = $1`,
      [id],
    );

    if (categoryResult.rows.length === 0) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    const userResult = await db.query(
      `SELECT id FROM "User" WHERE email = $1`,
      [session.user.email],
    );

    if (categoryResult.rows[0].adminId !== userResult.rows[0].id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete category (CASCADE will remove associated models)
    await db.query(`DELETE FROM "Category" WHERE id = $1`, [id]);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting category:", error);
    return Response.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
