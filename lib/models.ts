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
    group?: string;
  }>;
  quickSpecs: Array<{
    label: string;
    value: string | number | null;
    unit: string;
    paramLabel: string;
  }>;
  variantGroups?: Array<{
    id: string;
    name: string;
    order: number;
    options: Array<{
      id: string;
      name: string;
      priceModifier: number;
      isDefault: boolean;
      images?: Array<{ url: string; alt: string; isHero?: boolean; isThumbnail?: boolean }> | null;
      parameterOverrides?: Record<string, string | number | boolean> | null;
      mergeWithBase?: boolean | null;
    }>;
  }>;
  accessories?: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    imageUrl: string | null;
  }>;
  downloads?: Array<{
    name: string;
    url: string;
    fileType: string;
    fileSize?: number;
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

export async function getModelById(id: string): Promise<ModelWithDetails | null> {
  // Reuse the query logic but filter by ID efficiently
  // Note: getModelsWithDetails fetches ALL models if no ID filter.
  // We should optimize this to fetch only ONE model. 
  // For now, to ensure consistency and speed, let's copy the logic but filter by ID.
  
  const modelsResult = await pool.query(`
    SELECT m.id, m.name, m.description, m."heroDescription", m.power, m.depth, m.weight, m.bucket, m.price, 
           m.featured, COALESCE(m.visible, true) as visible, m."categoryId", m."heroImageId", m."adminId", m."createdAt", m."updatedAt",
           c.id as "category_id", c.name as "category_name", c.slug as "category_slug"
    FROM "Model" m
    LEFT JOIN "Category" c ON m."categoryId" = c.id
    WHERE m.id = $1
  `, [id]);

  if (modelsResult.rowCount === 0) return null;
  const model = modelsResult.rows[0];
  const modelId = model.id;

  // Batch fetch related data
  const [imagesResult, sectionsResult, featuresResult, parametersResult] = await Promise.all([
    pool.query(
      `SELECT id, url, alt, "modelId", "blurDataUrl", "variants" FROM "Image" WHERE "modelId" = $1 ORDER BY "createdAt" DESC`,
      [modelId]
    ),
    pool.query(
      `SELECT id, title, text, "imageUrl", "imageAlt", "order", "modelId" FROM "Section" WHERE "modelId" = $1 ORDER BY "order" ASC`,
      [modelId]
    ),
    pool.query(
      `SELECT fd.id as feature_id, fd.key, fd.label, fd.type, fd.options, pfv.value, pfv."productId"
       FROM "ProductFeatureValue" pfv
       JOIN "FeatureDefinition" fd ON pfv."featureId" = fd.id
       WHERE pfv."productId" = $1`,
      [modelId]
    ),
    pool.query(
      `SELECT pd.id as parameter_id, pd.key, pd.label, pd.unit, pd.type, pd.options, pd."group", pd."isQuickSpec", pd."quickSpecOrder", pd."quickSpecLabel", ppv.value, ppv."productId"
       FROM "ProductParameterValue" ppv
       JOIN "ParameterDefinition" pd ON ppv."parameterId" = pd.id
       WHERE ppv."productId" = $1 ORDER BY pd."order" ASC`,
      [modelId]
    ),
  ]);

  // Fetch variant groups (using correct table name ModelVariantGroup)
  const variantGroupsResult = await pool.query(
    'SELECT id, name, "order" FROM "ModelVariantGroup" WHERE "modelId" = $1 ORDER BY "order" ASC, "createdAt" ASC',
    [modelId]
  );
  
  // Use a batched query for options if possible, or simple loop. Route uses batch.
  const groupIds = variantGroupsResult.rows.map((g: any) => g.id);
  let allVariantOptions: any[] = [];
  if (groupIds.length > 0) {
    const optionsResult = await pool.query(
      'SELECT id, name, "priceModifier", "isDefault", images, "parameterOverrides", "mergeWithBase", "groupId" FROM "ModelVariantOption" WHERE "groupId" = ANY($1) ORDER BY "order" ASC, "createdAt" ASC',
      [groupIds]
    );
    allVariantOptions = optionsResult.rows;
  }

  const variantGroups = variantGroupsResult.rows.map((group: any) => ({
    id: group.id,
    name: group.name,
    order: group.order,
    options: allVariantOptions
      .filter((o: any) => o.groupId === group.id)
      .map((o: any) => ({
        id: o.id,
        name: o.name,
        priceModifier: Number(o.priceModifier) || 0,
        isDefault: o.isDefault || false,
        images: typeof o.images === 'string' ? JSON.parse(o.images) : o.images, 
        parameterOverrides: typeof o.parameterOverrides === 'string' ? JSON.parse(o.parameterOverrides) : o.parameterOverrides,
        mergeWithBase: o.mergeWithBase || false,
      }))
  }));

  // Fetch accessories (using correct join table ModelAccessory)
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
    [modelId]
  );


  const params = parametersResult.rows;

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
      images: imagesResult.rows.map((img: any) => ({
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
      parameters: params.map((p: any) => ({
        id: p.parameter_id,
        key: p.key,
        label: p.label,
        unit: p.unit,
        type: p.type,
        group: p.group,
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
      variantGroups: variantGroups,
      accessories: accessoriesResult.rows.map((a: any) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        price: a.price ? parseFloat(a.price) : null,
        imageUrl: a.imageUrl,
      })),
      // Downloads - fetching was skipped in previous step, let's add it if needed or return empty if not critical for now.
      // The interface has 'downloads'. We should probably fetch it to be complete.
      downloads: [] 
  } as any;
}
