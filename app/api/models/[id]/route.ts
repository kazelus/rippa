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
      `SELECT fd.id as feature_id, fd.key, fd.label, fd.type, fd.options, pfv.value
       FROM "ProductFeatureValue" pfv
       JOIN "FeatureDefinition" fd ON pfv."featureId" = fd.id
       WHERE pfv."productId" = $1`,
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
      power,
      depth,
      weight,
      bucket,
      price,
      featured,
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

    if (!name || !power || !depth || !weight || !bucket || !price) {
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
        "categoryId" = $10,
        "heroImageId" = COALESCE($11, "heroImageId"),
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $12`,
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
      const incomingUrls = new Set(images.map((i) => i.url));

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
