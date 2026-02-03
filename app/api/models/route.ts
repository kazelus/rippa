import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getModels, createModel } from "@/lib/services";
import { initializeDatabase, pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();

    // Fetch models with category info
    const modelsResult = await pool.query(`
      SELECT m.id, m.name, m.description, m."heroDescription", m.power, m.depth, m.weight, m.bucket, m.price, 
             m.featured, m."categoryId", m."heroImageId", m."adminId", m."createdAt", m."updatedAt",
             c.id as "category_id", c.name as "category_name", c.slug as "category_slug"
      FROM "Model" m
      LEFT JOIN "Category" c ON m."categoryId" = c.id
      ORDER BY m."createdAt" DESC
    `);

    // Fetch images and sections for each model
    const modelsWithImages = await Promise.all(
      modelsResult.rows.map(async (model: any) => {
        const imagesResult = await pool.query(
          'SELECT id, url, alt FROM "Image" WHERE "modelId" = $1 ORDER BY "createdAt" DESC',
          [model.id],
        );

        const sectionsResult = await pool.query(
          'SELECT id, title, text, "imageUrl", "imageAlt", "order" FROM "Section" WHERE "modelId" = $1 ORDER BY "order" ASC',
          [model.id],
        );

        // Fetch product feature values (join with definitions)
        const featuresResult = await pool.query(
          `SELECT fd.id as feature_id, fd.key, fd.label, fd.type, fd.options, pfv.value
           FROM "ProductFeatureValue" pfv
           JOIN "FeatureDefinition" fd ON pfv."featureId" = fd.id
           WHERE pfv."productId" = $1`,
          [model.id],
        );

        return {
          id: model.id,
          name: model.name,
          description: model.description,
          heroDescription: model.heroDescription,
          power: model.power,
          depth: model.depth,
          weight: model.weight,
          bucket: model.bucket,
          price: model.price,
          featured: model.featured,
          categoryId: model.categoryId,
          heroImageId: model.heroImageId,
          category: model.category_id
            ? {
                id: model.category_id,
                name: model.category_name,
                slug: model.category_slug,
              }
            : null,
          adminId: model.adminId,
          createdAt: model.createdAt,
          updatedAt: model.updatedAt,
          images: imagesResult.rows,
          sections: sectionsResult.rows.map((s: any) => ({
            title: s.title,
            text: s.text,
            image: s.imageUrl
              ? { url: s.imageUrl, alt: s.imageAlt || s.title }
              : undefined,
          })),
          features: featuresResult.rows.map((f: any) => ({
            id: f.feature_id,
            key: f.key,
            label: f.label,
            type: f.type,
            options: f.options ? JSON.parse(f.options) : null,
            value: f.value || null,
          })),
        };
      }),
    );

    return NextResponse.json(modelsWithImages);
  } catch (error) {
    console.error("[MODELS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (!name || !power || !depth || !weight || !bucket || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    console.log("[MODELS_POST] Received data:", {
      name,
      power,
      categoryId,
      heroImageId,
      adminId: session.user.id,
    });

    // Insert model with category and heroImageId
    const modelResult = await pool.query(
      `INSERT INTO "Model" (id, name, description, "heroDescription", power, depth, weight, bucket, price, featured, "categoryId", "heroImageId", "adminId", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       RETURNING id, name, description, "heroDescription", power, depth, weight, bucket, price, featured, "categoryId", "heroImageId", "adminId", "createdAt", "updatedAt"`,
      [
        name,
        description || null,
        heroDescription || null,
        power,
        depth,
        weight,
        bucket,
        price,
        featured || false,
        categoryId || null,
        heroImageId || null,
        session.user.id,
      ],
    );

    const model = modelResult.rows[0];

    // Insert images if provided
    if (images.length > 0 && model) {
      for (const image of images) {
        await pool.query(
          'INSERT INTO "Image" (id, url, alt, "modelId", "createdAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW())',
          [image.url, image.alt || "", model.id],
        );
      }
    }

    // Insert sections if provided
    if (sections.length > 0 && model) {
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
            model.id,
          ],
        );
      }
    }

    // Insert downloads if provided
    if (downloads.length > 0 && model) {
      for (const download of downloads) {
        await pool.query(
          'INSERT INTO "Download" (id, name, url, "fileType", "fileSize", "modelId", "createdAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW())',
          [
            download.name,
            download.url,
            download.fileType,
            download.fileSize || 0,
            model.id,
          ],
        );
      }
    }

    // Insert provided feature values (if any)
    if (body.features && Array.isArray(body.features) && model) {
      for (const f of body.features) {
        // expect { featureId, value }
        if (!f.featureId) continue;
        await pool.query(
          'INSERT INTO "ProductFeatureValue" (id, "productId", "featureId", value, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3::jsonb, NOW(), NOW()) ON CONFLICT ("productId", "featureId") DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()',
          [model.id, f.featureId, JSON.stringify(f.value ?? null)],
        );
      }
    }

    // Fetch images and sections back
    const imagesResult = await pool.query(
      'SELECT id, url, alt FROM "Image" WHERE "modelId" = $1',
      [model.id],
    );

    const sectionsResult = await pool.query(
      'SELECT id, title, text, "imageUrl", "imageAlt" FROM "Section" WHERE "modelId" = $1 ORDER BY "order" ASC',
      [model.id],
    );

    const downloadsResult = await pool.query(
      'SELECT id, name, url, "fileType", "fileSize" FROM "Download" WHERE "modelId" = $1 ORDER BY "createdAt" DESC',
      [model.id],
    );

    let categoryInfo = null;
    if (categoryId) {
      const categoryResult = await pool.query(
        'SELECT id, name, slug FROM "Category" WHERE id = $1',
        [categoryId],
      );
      if (categoryResult.rows.length > 0) {
        categoryInfo = categoryResult.rows[0];
      }
    }

    return NextResponse.json(
      {
        ...model,
        category: categoryInfo,
        images: imagesResult.rows,
        sections: sectionsResult.rows.map((s: any) => ({
          title: s.title,
          text: s.text,
          image: s.imageUrl
            ? { url: s.imageUrl, alt: s.imageAlt || s.title }
            : undefined,
        })),
        downloads: downloadsResult.rows,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[MODELS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
