-- CreateTable
CREATE TABLE "FeatureDefinition" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFeatureValue" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "value" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductFeatureValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeatureDefinition_categoryId_idx" ON "FeatureDefinition"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureDefinition_categoryId_key_key" ON "FeatureDefinition"("categoryId", "key");

-- CreateIndex
CREATE INDEX "ProductFeatureValue_productId_idx" ON "ProductFeatureValue"("productId");

-- CreateIndex
CREATE INDEX "ProductFeatureValue_featureId_idx" ON "ProductFeatureValue"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFeatureValue_productId_featureId_key" ON "ProductFeatureValue"("productId", "featureId");

-- AddForeignKey
ALTER TABLE "FeatureDefinition" ADD CONSTRAINT "FeatureDefinition_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFeatureValue" ADD CONSTRAINT "ProductFeatureValue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFeatureValue" ADD CONSTRAINT "ProductFeatureValue_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "FeatureDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
