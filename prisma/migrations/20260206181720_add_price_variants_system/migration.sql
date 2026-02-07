-- AlterTable
ALTER TABLE "FeatureDefinition" ADD COLUMN     "affectsPrice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVariant" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceModifier" DECIMAL(10,2),
ADD COLUMN     "priceModifierType" TEXT DEFAULT 'fixed';

-- CreateTable
CREATE TABLE "ParameterDefinition" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unit" TEXT,
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "group" TEXT,
    "affectsPrice" BOOLEAN NOT NULL DEFAULT false,
    "priceModifier" DECIMAL(10,2),
    "priceModifierType" TEXT DEFAULT 'fixed',
    "isVariant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParameterDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductParameterValue" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "value" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductParameterValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParameterDefinition_categoryId_idx" ON "ParameterDefinition"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ParameterDefinition_categoryId_key_key" ON "ParameterDefinition"("categoryId", "key");

-- CreateIndex
CREATE INDEX "ProductParameterValue_productId_idx" ON "ProductParameterValue"("productId");

-- CreateIndex
CREATE INDEX "ProductParameterValue_parameterId_idx" ON "ProductParameterValue"("parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductParameterValue_productId_parameterId_key" ON "ProductParameterValue"("productId", "parameterId");

-- AddForeignKey
ALTER TABLE "ProductParameterValue" ADD CONSTRAINT "ProductParameterValue_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "ParameterDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
