import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool, initializeDatabase } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await initializeDatabase();
    const { id } = await params;

    const modelResult = await pool.query(
      'SELECT * FROM "Model" WHERE id = $1',
      [id],
    );

    if (modelResult.rows.length === 0) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const model = modelResult.rows[0];

    // Fetch images and sections
    const imagesResult = await pool.query(
      'SELECT id, url, alt FROM "Image" WHERE "modelId" = $1 ORDER BY "createdAt" DESC',
      [id],
    );

    const sectionsResult = await pool.query(
      'SELECT id, title, text, "imageUrl", "imageAlt" FROM "Section" WHERE "modelId" = $1 ORDER BY "order" ASC',
      [id],
    );

    const downloadsResult = await pool.query(
      'SELECT id, name, url, "fileType", "fileSize" FROM "Download" WHERE "modelId" = $1 ORDER BY "createdAt" DESC',
      [id],
    );

    // Fetch product feature values (join with definitions)
    const featuresResult = await pool.query(
      `SELECT fd.id as feature_id, fd.key, fd.label, fd.type, fd.options, fd."affectsPrice", fd."priceModifier", fd."priceModifierType", fd."isVariant", fd."variantOptions", pfv.value
       FROM "ProductFeatureValue" pfv
       JOIN "FeatureDefinition" fd ON pfv."featureId" = fd.id
       WHERE pfv."productId" = $1`,
      [id],
    );

    // Fetch product parameter values (join with definitions)
    const parametersResult = await pool.query(
      `SELECT pd.id as parameter_id, pd.key, pd.label, pd.type, pd.unit, pd.options, pd."group", pd."affectsPrice", pd."priceModifier", pd."priceModifierType", pd."isVariant", pd."variantOptions", pd."isQuickSpec", pd."quickSpecOrder", pd."quickSpecLabel", ppv.value
       FROM "ProductParameterValue" ppv
       JOIN "ParameterDefinition" pd ON ppv."parameterId" = pd.id
       WHERE ppv."productId" = $1
       ORDER BY pd."order" ASC`,
      [id],
    );

    // Fetch model variant groups + options
    const variantGroupsResult = await pool.query(
      'SELECT * FROM "ModelVariantGroup" WHERE "modelId" = $1 ORDER BY "order" ASC, "createdAt" ASC',
      [id],
    );
    const variantGroups = [];
    for (const group of variantGroupsResult.rows) {
      const optionsResult = await pool.query(
        'SELECT * FROM "ModelVariantOption" WHERE "groupId" = $1 ORDER BY "order" ASC, "createdAt" ASC',
        [group.id],
      );
      variantGroups.push({
        id: group.id,
        name: group.name,
        order: group.order,
        options: optionsResult.rows.map((o: any) => ({
          id: o.id,
          name: o.name,
          priceModifier: parseFloat(o.priceModifier) || 0,
          isDefault: o.isDefault || false,
          images: o.images || null,
          parameterOverrides: o.parameterOverrides || null,
        })),
      });
    }

    // Fetch linked accessories (models linked via ModelAccessory in BOTH directions)
    // Only show accessories that are visible (not hidden from the store)
    const accessoriesResult = await pool.query(
      `SELECT DISTINCT m.id, m.name, m.description, m.price,
              (SELECT url FROM "Image" WHERE "modelId" = m.id ORDER BY "createdAt" DESC LIMIT 1) as "imageUrl"
       FROM "ModelAccessory" ma
       JOIN "Model" m ON (
         (ma."parentModelId" = $1 AND m.id = ma."accessoryModelId")
         OR
         (ma."accessoryModelId" = $1 AND m.id = ma."parentModelId")
       )
       WHERE m.id != $1 AND COALESCE(m.visible, true) = true
       ORDER BY m.name ASC`,
      [id],
    );

    return NextResponse.json({
      ...model,
      images: imagesResult.rows,
      sections: sectionsResult.rows.map((s: any) => ({
        title: s.title,
        text: s.text,
        image: s.imageUrl
          ? { url: s.imageUrl, alt: s.imageAlt || s.title }
          : undefined,
      })),
      downloads: downloadsResult.rows,
      features: featuresResult.rows.map((f: any) => ({
        id: f.feature_id,
        key: f.key,
        label: f.label,
        type: f.type,
        options: f.options
          ? typeof f.options === "string"
            ? JSON.parse(f.options)
            : f.options
          : null,
        value: f.value ?? null,
        affectsPrice: f.affectsPrice || false,
        priceModifier: f.priceModifier ? parseFloat(f.priceModifier) : null,
        priceModifierType: f.priceModifierType || "fixed",
        isVariant: f.isVariant || false,
        variantOptions: f.variantOptions || null,
      })),
      parameters: parametersResult.rows.map((p: any) => ({
        id: p.parameter_id,
        key: p.key,
        label: p.label,
        type: p.type,
        unit: p.unit,
        group: p.group,
        options: p.options
          ? typeof p.options === "string"
            ? JSON.parse(p.options)
            : p.options
          : null,
        value: p.value ?? null,
        affectsPrice: p.affectsPrice || false,
        priceModifier: p.priceModifier ? parseFloat(p.priceModifier) : null,
        priceModifierType: p.priceModifierType || "fixed",
        isVariant: p.isVariant || false,
        variantOptions: p.variantOptions || null,
        isQuickSpec: p.isQuickSpec || false,
        quickSpecOrder: p.quickSpecOrder || 0,
        quickSpecLabel: p.quickSpecLabel || null,
      })),
      variantGroups,
      accessories: accessoriesResult.rows.map((a: any) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        price: a.price ? parseFloat(a.price) : null,
        imageUrl: a.imageUrl,
      })),
    });
  } catch (error) {
    console.error("[MODEL_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
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
    const body = await req.json();
    const {
      name,
      description,
      heroDescription,
      power = "",
      depth = "",
      weight = "",
      bucket = "",
      price,
      featured,
      visible,
      categoryId,
      heroImageId,
      images = [],
      sections = [],
      downloads = [],
    } = body;

    const hasImagesField = Object.prototype.hasOwnProperty.call(body, "images");
    console.log(
      "[MODEL_PUT] images field present:",
      hasImagesField,
      "count:",
      Array.isArray(images) ? images.length : "no-array",
    );

    if (!name || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify model exists and user is owner
    const modelResult = await pool.query(
      'SELECT "adminId" FROM "Model" WHERE id = $1',
      [id],
    );

    if (modelResult.rows.length === 0) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    if (modelResult.rows[0].adminId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - you can only edit your own models" },
        { status: 403 },
      );
    }

    // Update model
    await pool.query(
      `UPDATE "Model" SET 
        name = $1, 
        description = $2,
        "heroDescription" = $3, 
        power = $4, 
        depth = $5, 
        weight = $6, 
        bucket = $7, 
        price = $8, 
        featured = $9,
        visible = $10,
        "categoryId" = $11,
        "heroImageId" = COALESCE($12, "heroImageId"),
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $13`,
      [
        name,
        description,
        heroDescription || null,
        power,
        depth,
        weight,
        bucket,
        price,
        featured,
        visible !== false,
        categoryId || null,
        // pass null if undefined so COALESCE will keep existing
        typeof heroImageId === "undefined" ? null : heroImageId,
        id,
      ],
    );

    // If request includes `images` field, merge new images and handle deletions
    if (hasImagesField) {
      // Get existing images
      const existingImages = await pool.query(
        'SELECT id, url FROM "Image" WHERE "modelId" = $1',
        [id],
      );
      const existingMap = new Map(
        existingImages.rows.map((r: any) => [r.url, r.id]),
      );
      const incomingUrls = new Set(images.map((i: any) => i.url));

      // Delete images that are not in the incoming list
      for (const existing of existingImages.rows) {
        if (!incomingUrls.has(existing.url)) {
          console.log("[MODEL_PUT] Deleting image:", existing.url);
          // Delete from DB
          await pool.query('DELETE FROM "Image" WHERE id = $1', [existing.id]);
          // Try to delete from filesystem
          const filename = existing.url.replace("/uploads/", "");
          const filepath = path.join(
            process.cwd(),
            "public",
            "uploads",
            filename,
          );
          try {
            await fs.unlink(filepath);
          } catch {
            // ignore
          }
        }
      }

      // Add new images
      for (const image of images) {
        if (!existingMap.has(image.url)) {
          console.log(
            "[MODEL_PUT] Inserting new image:",
            image.url,
            "for model",
            id,
          );
          await pool.query(
            'INSERT INTO "Image" (id, url, alt, "modelId", "createdAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW())',
            [image.url, image.alt || "", id],
          );
        }
      }
    }

    // Handle sections: replace all sections if provided
    if (Array.isArray(sections) && sections.length > 0) {
      console.log("[MODEL_PUT] Updating sections, count:", sections.length);

      // Delete old sections
      await pool.query('DELETE FROM "Section" WHERE "modelId" = $1', [id]);

      // Insert new sections
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        await pool.query(
          'INSERT INTO "Section" (id, title, text, "imageUrl", "imageAlt", "order", "modelId", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, NOW(), NOW())',
          [
            section.title || "",
            section.text || "",
            section.image?.url || null,
            section.image?.alt || null,
            i,
            id,
          ],
        );
      }
    }

    // Handle downloads: replace all downloads if provided
    if (Array.isArray(downloads) && downloads.length > 0) {
      console.log("[MODEL_PUT] Updating downloads, count:", downloads.length);

      // Delete old downloads
      await pool.query('DELETE FROM "Download" WHERE "modelId" = $1', [id]);

      // Insert new downloads
      for (const download of downloads) {
        await pool.query(
          'INSERT INTO "Download" (id, name, url, "fileType", "fileSize", "modelId", "createdAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW())',
          [
            download.name || "",
            download.url || "",
            download.fileType || "pdf",
            download.fileSize || null,
            id,
          ],
        );
      }
    }

    // Handle feature values if provided
    if (body.features && Array.isArray(body.features)) {
      for (const f of body.features) {
        if (!f.featureId) continue;
        await pool.query(
          'INSERT INTO "ProductFeatureValue" (id, "productId", "featureId", value, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3::jsonb, NOW(), NOW()) ON CONFLICT ("productId", "featureId") DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()',
          [id, f.featureId, JSON.stringify(f.value ?? null)],
        );
      }
    }

    // Handle parameter values if provided
    if (body.parameters && Array.isArray(body.parameters)) {
      for (const p of body.parameters) {
        if (!p.parameterId) continue;
        await pool.query(
          'INSERT INTO "ProductParameterValue" (id, "productId", "parameterId", value, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3::jsonb, NOW(), NOW()) ON CONFLICT ("productId", "parameterId") DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()',
          [id, p.parameterId, JSON.stringify(p.value ?? null)],
        );
      }
    }

    // Fetch updated model with images
    const updatedModel = await pool.query(
      'SELECT * FROM "Model" WHERE id = $1',
      [id],
    );

    const updatedImages = await pool.query(
      'SELECT id, url, alt FROM "Image" WHERE "modelId" = $1 ORDER BY "createdAt" DESC',
      [id],
    );

    const updatedSections = await pool.query(
      'SELECT id, title, text, "imageUrl", "imageAlt" FROM "Section" WHERE "modelId" = $1 ORDER BY "order" ASC',
      [id],
    );

    const updatedDownloads = await pool.query(
      'SELECT id, name, url, "fileType", "fileSize" FROM "Download" WHERE "modelId" = $1 ORDER BY "createdAt" DESC',
      [id],
    );

    return NextResponse.json(
      {
        ...updatedModel.rows[0],
        images: updatedImages.rows,
        sections: updatedSections.rows.map((s: any) => ({
          title: s.title,
          text: s.text,
          image: s.imageUrl
            ? { url: s.imageUrl, alt: s.imageAlt || s.title }
            : undefined,
        })),
        downloads: updatedDownloads.rows,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[MODEL_PUT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
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
    const body = await req.json();

    // Verify model exists
    const modelResult = await pool.query(
      'SELECT * FROM "Model" WHERE id = $1',
      [id],
    );

    if (modelResult.rows.length === 0) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    // Build dynamic SET clause from allowed fields
    const allowedFields: Record<string, string> = {
      visible: "visible",
      featured: "featured",
      name: "name",
      price: "price",
    };

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, column] of Object.entries(allowedFields)) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        setClauses.push(`"${column}" = $${paramIndex}`);
        values.push(body[key]);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    setClauses.push(`"updatedAt" = NOW()`);
    values.push(id);

    const query = `UPDATE "Model" SET ${setClauses.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("[MODEL_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    // Verify model exists and user is owner
    const modelResult = await pool.query(
      'SELECT "adminId" FROM "Model" WHERE id = $1',
      [id],
    );

    if (modelResult.rows.length === 0) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    if (modelResult.rows[0].adminId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - you can only delete your own models" },
        { status: 403 },
      );
    }

    // Get images to delete from filesystem
    const images = await pool.query(
      'SELECT url FROM "Image" WHERE "modelId" = $1',
      [id],
    );

    // Delete images from filesystem
    for (const image of images.rows) {
      const filename = image.url.replace("/uploads/", "");
      const filepath = path.join(process.cwd(), "public", "uploads", filename);
      try {
        await fs.unlink(filepath);
      } catch {
        // File might not exist, continue
      }
    }

    // Delete model (images will be deleted via CASCADE)
    await pool.query('DELETE FROM "Model" WHERE id = $1', [id]);

    return NextResponse.json(
      { success: true, message: "Model deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[MODEL_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
