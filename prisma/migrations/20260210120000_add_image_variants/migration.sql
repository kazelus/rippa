-- Migration: add_image_variants
-- Adds blurDataUrl and variants columns to Image table

ALTER TABLE "Image"
  ADD COLUMN IF NOT EXISTS "blurDataUrl" TEXT;

ALTER TABLE "Image"
  ADD COLUMN IF NOT EXISTS "variants" JSONB;
