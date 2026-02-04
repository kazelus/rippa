-- AlterTable
ALTER TABLE "Model" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Model_categoryId_idx" ON "Model"("categoryId");

-- AddForeignKey
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Model_categoryId_fkey'
  ) THEN
    ALTER TABLE "Model" ADD CONSTRAINT "Model_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
