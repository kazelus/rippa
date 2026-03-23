import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getModels, createModel } from "@/lib/services";
import { initializeDatabase, pool } from "@/lib/db";

import { getModelsWithDetails } from "@/lib/models";

function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/[^\w\-]+/g, "") // remove non-word chars
    .replace(/\-\-+/g, "-") // replace multiple hyphens
    .replace(/^-+/, "") // trim hyphen from start
    .replace(/-+$/, ""); // trim hyphen from end
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const res = await pool.query('SELECT id FROM "Model" WHERE slug = $1', [slug]);
    if (res.rowCount === 0) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();

    // Check if admin is requesting (to show all models including hidden)
    const session = await getServerSession(authOptions);
    const isAdmin = !!session?.user?.id;
    const showAll = req.nextUrl.searchParams.get("all") === "true" && isAdmin;

    const models = await getModelsWithDetails(showAll);

    // Cache public responses for 60s on CDN, stale-while-revalidate 300s
    const res = NextResponse.json(models);
    if (!showAll) {
      res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    }
    return res;
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
      faqs = [],
      availability = "Dostępne od ręki",
    } = body;

    if (!name || !price) {
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

    const baseSlug = generateSlug(name);
    const uniqueSlug = await ensureUniqueSlug(baseSlug);

    // Insert model with category and heroImageId
    const modelResult = await pool.query(
      `INSERT INTO "Model" (id, name, slug, description, "heroDescription", power, depth, weight, bucket, price, featured, visible, "categoryId", "heroImageId", "faqs", "availability", "adminId", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
       RETURNING id, name, slug, description, "heroDescription", power, depth, weight, bucket, price, featured, visible, "categoryId", "heroImageId", "faqs", "availability", "adminId", "createdAt", "updatedAt"`,
      [
        name,
        uniqueSlug,
        description || null,
        heroDescription || null,
        power,
        depth,
        weight,
        bucket,
        price,
        featured || false,
        visible !== false,
        categoryId || null,
        heroImageId || null,
        JSON.stringify(faqs),
        availability,
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

    // Insert provided parameter values (if any)
    if (body.parameters && Array.isArray(body.parameters) && model) {
      for (const p of body.parameters) {
        // expect { parameterId, value }
        if (!p.parameterId) continue;
        await pool.query(
          'INSERT INTO "ProductParameterValue" (id, "productId", "parameterId", value, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3::jsonb, NOW(), NOW()) ON CONFLICT ("productId", "parameterId") DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()',
          [model.id, p.parameterId, JSON.stringify(p.value ?? null)],
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
