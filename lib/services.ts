import { hash, compare } from "bcryptjs";
import { db } from "./db";

export interface User {
  id: string;
  email: string;
  name: string | null;
  password?: string;
  createdAt: Date;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db.query(
    `SELECT id, email, name, password, "createdAt" FROM "User" WHERE email = $1`,
    [email],
  );
  return result.rows[0] || null;
}

export async function createUser(
  email: string,
  password: string,
  name: string = "Admin",
): Promise<User> {
  const hashedPassword = await hash(password, 10);
  const result = await db.query(
    `INSERT INTO "User" (id, name, email, password, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
     RETURNING id, email, name, "createdAt"`,
    [name, email, hashedPassword],
  );
  return result.rows[0];
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return compare(plainPassword, hashedPassword);
}

// Models functions
export interface Model {
  id: string;
  name: string;
  description: string | null;
  power?: string;
  depth?: string;
  weight?: string;
  bucket?: string;
  price: string;
  featured: boolean;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getModels(): Promise<Model[]> {
  const result = await db.query(
    `SELECT * FROM "Model" ORDER BY "createdAt" DESC`,
  );
  return result.rows;
}

export async function getModelById(id: string): Promise<Model | null> {
  const result = await db.query(`SELECT * FROM "Model" WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

export async function createModel(
  data: Omit<Model, "id" | "createdAt" | "updatedAt">,
  adminId: string,
): Promise<Model> {
  const result = await db.query(
    `INSERT INTO "Model" (name, description, power, depth, weight, bucket, price, featured, "adminId")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.name,
      data.description,
      data.power,
      data.depth,
      data.weight,
      data.bucket,
      data.price,
      data.featured,
      adminId,
    ],
  );
  return result.rows[0];
}

export async function updateModel(
  id: string,
  data: Partial<Omit<Model, "id" | "createdAt" | "updatedAt">>,
): Promise<Model | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(data)) {
    updates.push(`"${key}" = $${paramCount}`);
    values.push(value);
    paramCount++;
  }

  updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await db.query(
    `UPDATE "Model" SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
    values,
  );

  return result.rows[0] || null;
}

export async function deleteModel(id: string): Promise<boolean> {
  const result = await db.query(`DELETE FROM "Model" WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}
