/*
  Warnings:

  - You are about to alter the column `categoryId` on the `Model` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_categoryId_fkey";

-- DropIndex
DROP INDEX "Model_categoryId_idx";

-- AlterTable
ALTER TABLE "Model" ALTER COLUMN "categoryId" SET DATA TYPE VARCHAR(255);

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
