import { pool } from "@/lib/db";
import { Model } from "@/lib/services";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ModelWithDetails extends Model {
  heroDescription?: string | null;
  visible: boolean;
  categoryId?: string | null;
  heroImageId?: string | null;
  category?: Category | null;
  images: Array<{
    id: string;
    url: string;
    alt: string;
    blurDataUrl?: string | null;
    variants?: any;
  }>;
  sections: Array<{
    title: string;
    text: string;
    image?: { url: string; alt: string };
  }>;
  features: Array<{
    id: string;
    key: string;
    label: string;
    type: string;
    options: any;
    value: any;
  }>;
  parameters: Array<{
    id: string;
    key: string;
    label: string;
    unit?: string;
    type: string;
    options: any;
    value: any;
    isQuickSpec: boolean;
    quickSpecOrder: number;
    quickSpecLabel?: string | null;
  }>;
  quickSpecs: Array<{
    label: string;
    value: string | number | null;
    unit: string;
    paramLabel: string;
  }>;
}

export async function getModelsWithDetails(isAdmin: boolean = false): Promise<ModelWithDetails[]> {
  // Fetch models with category info
  const modelsResult = await pool.query(`
    SELECT m.id, m.name, m.description, m."heroDescription", m.power, m.depth, m.weight, m.bucket, m.price, 
           m.featured, COALESCE(m.visible, true) as visible, m."categoryId", m."heroImageId", m."adminId", m."createdAt", m."updatedAt",
           c.id as "category_id", c.name as "category_name", c.slug as "category_slug"
    FROM "Model" m
    LEFT JOIN "Category" c ON m."categoryId" = c.id
    ${!isAdmin ? "WHERE COALESCE(m.visible, true) = true" : ""}
    ORDER BY m."createdAt" DESC
  `);

  const modelIds = modelsResult.rows.map((m: any) => m.id);

  if (modelIds.length === 0) {
    return [];
  }

  // Batch fetch all related data in parallel (eliminates N+1)
  const [imagesResult, sectionsResult, featuresResult, parametersResult] = await Promise.all([
    pool.query(
      `SELECT id, url, alt, "modelId", "blurDataUrl", "variants" FROM "Image" WHERE "modelId" = ANY($1) ORDER BY "createdAt" DESC`,
      [modelIds]
    ),
    pool.query(
      `SELECT id, title, text, "imageUrl", "imageAlt", "order", "modelId" FROM "Section" WHERE "modelId" = ANY($1) ORDER BY "order" ASC`,
      [modelIds]
    ),
    pool.query(
      `SELECT fd.id as feature_id, fd.key, fd.label, fd.type, fd.options, pfv.value, pfv."productId"
       FROM "ProductFeatureValue" pfv
       JOIN "FeatureDefinition" fd ON pfv."featureId" = fd.id
       WHERE pfv."productId" = ANY($1)`,
      [modelIds]
    ),
    pool.query(
      `SELECT pd.id as parameter_id, pd.key, pd.label, pd.unit, pd.type, pd.options, pd."isQuickSpec", pd."quickSpecOrder", pd."quickSpecLabel", ppv.value, ppv."productId"
       FROM "ProductParameterValue" ppv
       JOIN "ParameterDefinition" pd ON ppv."parameterId" = pd.id
       WHERE ppv."productId" = ANY($1)`,
      [modelIds]
    ),
  ]);

  // Index by modelId for O(1) lookups
  const imagesByModel = new Map<string, any[]>();
  for (const row of imagesResult.rows) {
    if (!imagesByModel.has(row.modelId)) imagesByModel.set(row.modelId, []);
    imagesByModel.get(row.modelId)!.push(row);
  }

  const sectionsByModel = new Map<string, any[]>();
  for (const row of sectionsResult.rows) {
    if (!sectionsByModel.has(row.modelId)) sectionsByModel.set(row.modelId, []);
    sectionsByModel.get(row.modelId)!.push(row);
  }

  const featuresByModel = new Map<string, any[]>();
  for (const row of featuresResult.rows) {
    if (!featuresByModel.has(row.productId)) featuresByModel.set(row.productId, []);
    featuresByModel.get(row.productId)!.push(row);
  }

  const parametersByModel = new Map<string, any[]>();
  for (const row of parametersResult.rows) {
    if (!parametersByModel.has(row.productId)) parametersByModel.set(row.productId, []);
    parametersByModel.get(row.productId)!.push(row);
  }

  // Assemble response
  return modelsResult.rows.map((model: any) => {
    const params = parametersByModel.get(model.id) || [];

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
      visible: model.visible,
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
      images: (imagesByModel.get(model.id) || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        blurDataUrl: img.blurDataUrl || null,
        variants: img.variants
          ? typeof img.variants === "string"
            ? JSON.parse(img.variants)
            : img.variants
          : null,
      })),
      sections: (sectionsByModel.get(model.id) || []).map((s: any) => ({
        title: s.title,
        text: s.text,
        image: s.imageUrl
          ? { url: s.imageUrl, alt: s.imageAlt || s.title }
          : undefined,
      })),
      features: (featuresByModel.get(model.id) || []).map((f: any) => ({
        id: f.feature_id,
        key: f.key,
        label: f.label,
        type: f.type,
        options: f.options ? JSON.parse(f.options) : null,
        value: f.value || null,
      })),
      parameters: params.map((p: any) => ({
        id: p.parameter_id,
        key: p.key,
        label: p.label,
        unit: p.unit,
        type: p.type,
        options: p.options ? JSON.parse(p.options) : null,
        value: p.value || null,
        isQuickSpec: p.isQuickSpec || false,
        quickSpecOrder: p.quickSpecOrder || 0,
        quickSpecLabel: p.quickSpecLabel || null,
      })),
      quickSpecs: params
        .filter((p: any) => p.isQuickSpec)
        .sort(
          (a: any, b: any) =>
            (a.quickSpecOrder || 0) - (b.quickSpecOrder || 0),
        )
        .map((p: any) => ({
          label: p.quickSpecLabel || p.label,
          value: p.value || null,
          unit: p.unit || "",
          paramLabel: p.label,
        })),
    };
  });
}
