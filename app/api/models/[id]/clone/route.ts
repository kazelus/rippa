import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool, initializeDatabase } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await initializeDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 1. Fetch original model
    const modelResult = await pool.query(
      'SELECT * FROM "Model" WHERE id = $1',
      [id],
    );
    if (modelResult.rows.length === 0) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    const original = modelResult.rows[0];

    // 2. Create cloned model (hidden by default, with "(kopia)" suffix)
    const clonedModel = await pool.query(
      `INSERT INTO "Model" (id, name, description, "heroDescription", power, depth, weight, bucket, price, featured, visible, "categoryId", "heroImageId", "adminId", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, false, false, $9, NULL, $10, NOW(), NOW())
       RETURNING *`,
      [
        original.name + " (kopia)",
        original.description || "",
        original.heroDescription || null,
        original.power || "",
        original.depth || "",
        original.weight || "",
        original.bucket || "",
        original.price || "0",
        original.categoryId || null,
        session.user.id,
      ],
    );
    const newId = clonedModel.rows[0].id;

    // 3. Clone images (references same URLs, no file duplication)
    const images = await pool.query(
      'SELECT url, alt FROM "Image" WHERE "modelId" = $1 ORDER BY "createdAt" ASC',
      [id],
    );
    for (const img of images.rows) {
      await pool.query(
        'INSERT INTO "Image" (id, url, alt, "modelId", "createdAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW())',
        [img.url, img.alt || "", newId],
      );
    }

    // Set heroImageId to first cloned image if original had one
    if (original.heroImageId) {
      const firstImage = await pool.query(
        'SELECT id FROM "Image" WHERE "modelId" = $1 ORDER BY "createdAt" ASC LIMIT 1',
        [newId],
      );
      if (firstImage.rows.length > 0) {
        await pool.query(
          'UPDATE "Model" SET "heroImageId" = $1 WHERE id = $2',
          [firstImage.rows[0].id, newId],
        );
      }
    }

    // 4. Clone sections
    const sections = await pool.query(
      'SELECT title, text, "imageUrl", "imageAlt", "order" FROM "Section" WHERE "modelId" = $1 ORDER BY "order" ASC',
      [id],
    );
    for (const sec of sections.rows) {
      await pool.query(
        'INSERT INTO "Section" (id, title, text, "imageUrl", "imageAlt", "order", "modelId", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, NOW(), NOW())',
        [
          sec.title || "",
          sec.text || "",
          sec.imageUrl || null,
          sec.imageAlt || null,
          sec.order || 0,
          newId,
        ],
      );
    }

    // 5. Clone downloads
    const downloads = await pool.query(
      'SELECT name, url, "fileType", "fileSize" FROM "Download" WHERE "modelId" = $1',
      [id],
    );
    for (const dl of downloads.rows) {
      await pool.query(
        'INSERT INTO "Download" (id, name, url, "fileType", "fileSize", "modelId", "createdAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW())',
        [dl.name, dl.url, dl.fileType, dl.fileSize, newId],
      );
    }

    // 6. Clone feature values
    const features = await pool.query(
      'SELECT "featureId", value FROM "ProductFeatureValue" WHERE "productId" = $1',
      [id],
    );
    for (const f of features.rows) {
      await pool.query(
        'INSERT INTO "ProductFeatureValue" (id, "productId", "featureId", value, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW())',
        [newId, f.featureId, f.value ? JSON.stringify(f.value) : null],
      );
    }

    // 7. Clone parameter values
    const parameters = await pool.query(
      'SELECT "parameterId", value FROM "ProductParameterValue" WHERE "productId" = $1',
      [id],
    );
    for (const p of parameters.rows) {
      await pool.query(
        'INSERT INTO "ProductParameterValue" (id, "productId", "parameterId", value, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW())',
        [newId, p.parameterId, p.value ? JSON.stringify(p.value) : null],
      );
    }

    // 8. Clone variant groups + options
    const variantGroups = await pool.query(
      'SELECT * FROM "ModelVariantGroup" WHERE "modelId" = $1 ORDER BY "order" ASC',
      [id],
    );
    for (const group of variantGroups.rows) {
      const newGroup = await pool.query(
        'INSERT INTO "ModelVariantGroup" (id, "modelId", name, "order", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW()) RETURNING id',
        [newId, group.name, group.order || 0],
      );
      const newGroupId = newGroup.rows[0].id;

      const options = await pool.query(
        'SELECT * FROM "ModelVariantOption" WHERE "groupId" = $1 ORDER BY "order" ASC',
        [group.id],
      );
      for (const opt of options.rows) {
        await pool.query(
          `INSERT INTO "ModelVariantOption" (id, "groupId", name, "priceModifier", "isDefault", images, "parameterOverrides", "order", "createdAt", "updatedAt")
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
          [
            newGroupId,
            opt.name,
            opt.priceModifier || 0,
            opt.isDefault || false,
            opt.images ? JSON.stringify(opt.images) : null,
            opt.parameterOverrides
              ? JSON.stringify(opt.parameterOverrides)
              : null,
            opt.order || 0,
          ],
        );
      }
    }

    // 9. Clone accessory links
    const accessories = await pool.query(
      'SELECT "accessoryModelId" FROM "ModelAccessory" WHERE "parentModelId" = $1',
      [id],
    );
    for (const acc of accessories.rows) {
      try {
        await pool.query(
          'INSERT INTO "ModelAccessory" (id, "parentModelId", "accessoryModelId") VALUES (gen_random_uuid()::text, $1, $2)',
          [newId, acc.accessoryModelId],
        );
      } catch {
        // unique constraint violation — skip
      }
    }

    return NextResponse.json(clonedModel.rows[0], { status: 201 });
  } catch (error) {
    console.error("[MODEL_CLONE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
