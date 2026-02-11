import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let formData: FormData | null = null;
    try {
      formData = await req.formData();
    } catch (err) {
      console.error("[UPLOAD] Failed to parse FormData:", err);
      return NextResponse.json(
        {
          error:
            "Failed to parse form data. The request may be too large or malformed. Try uploading smaller files or increase the server's client body size limit.",
        },
        { status: 413 },
      );
    }

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images allowed." },
        { status: 400 },
      );
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Plik jest za duży. Maksymalnie 20MB." },
        { status: 400 },
      );
    }

    // Generate unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${file.name}`;

    // Prefer S3 if configured
    const s3Bucket = process.env.S3_BUCKET;
    if (s3Bucket) {
      // Upload to S3
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const s3 = new S3Client({
        region: process.env.S3_REGION,
        credentials: process.env.AWS_ACCESS_KEY_ID
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
            }
          : undefined,
      });

      // Upload original
      const putCmd = new PutObjectCommand({
        Bucket: s3Bucket,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read",
        CacheControl: "public, max-age=31536000, immutable",
      });

      await s3.send(putCmd);

      // Try to generate responsive variants (avif/webp) and a small blurDataURL if sharp available
      const variants: Array<{ key: string; url: string }> = [];
      let blurDataURL: string | undefined = undefined;
      try {
        const sharp = await import("sharp");
        const sizes = [320, 640, 1200];
        const base = path.parse(filename).name;

        // Generate tiny placeholder (blur) - use webp small thumbnail
        try {
          const thumb = await sharp.default(buffer).resize({ width: 20 }).webp({ quality: 50 }).toBuffer();
          blurDataURL = `data:image/webp;base64,${thumb.toString("base64")}`;
        } catch (thumbErr) {
          console.warn("[UPLOAD] blurDataURL generation failed:", (thumbErr as any)?.message || thumbErr);
        }

        for (const w of sizes) {
          // AVIF
          const avifBuf = await sharp.default(buffer).resize({ width: w }).avif().toBuffer();
          const avifKey = `${base}@${w}.avif`;
          await s3.send(
            new PutObjectCommand({
              Bucket: s3Bucket,
              Key: avifKey,
              Body: avifBuf,
              ContentType: "image/avif",
              ACL: "public-read",
              CacheControl: "public, max-age=31536000, immutable",
            }),
          );
          variants.push({ key: avifKey, url: `https://${s3Bucket}.s3.${process.env.S3_REGION}.amazonaws.com/${encodeURIComponent(avifKey)}` });

          // WEBP
          const webpBuf = await sharp.default(buffer).resize({ width: w }).webp().toBuffer();
          const webpKey = `${base}@${w}.webp`;
          await s3.send(
            new PutObjectCommand({
              Bucket: s3Bucket,
              Key: webpKey,
              Body: webpBuf,
              ContentType: "image/webp",
              ACL: "public-read",
              CacheControl: "public, max-age=31536000, immutable",
            }),
          );
          variants.push({ key: webpKey, url: `https://${s3Bucket}.s3.${process.env.S3_REGION}.amazonaws.com/${encodeURIComponent(webpKey)}` });
        }
      } catch (err) {
        // sharp not available or processing failed — continue without variants
        console.warn("[UPLOAD] sharp processing skipped:", (err as any)?.message || err);
      }

      const url = `https://${s3Bucket}.s3.${process.env.S3_REGION}.amazonaws.com/${encodeURIComponent(filename)}`;

      // If upload is associated with a model, create Image record
      const modelId = formData.get("modelId") as string | null;
      const alt = (formData.get("alt") as string) || undefined;
      if (modelId) {
        try {
          const created = await prisma.image.create({
            data: {
              url,
              alt,
              modelId,
              blurDataUrl: blurDataURL,
              variants: variants.length ? variants.map((v) => v.url) : undefined,
            },
          });
          return NextResponse.json({ success: true, url, filename, variants, blurDataURL, image: created }, { status: 201 });
        } catch (dbErr) {
          console.warn("[UPLOAD] failed to create image record:", (dbErr as any)?.message || dbErr);
          return NextResponse.json({ success: true, url, filename, variants, blurDataURL }, { status: 201 });
        }
      }

      return NextResponse.json({ success: true, url, filename, variants, blurDataURL }, { status: 201 });
    }

    // Check if we have Blob token (Vercel Blob) or use local storage (development)
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (blobToken) {
      // Production (Vercel): Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
      });

      // Note: Vercel Blob currently doesn't let us set Cache-Control from here.
      return NextResponse.json(
        {
          success: true,
          url: blob.url,
          filename: filename,
        },
        { status: 201 },
      );
    } else {
      // Development: Save to local filesystem
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      // Write original file
      const filepath = path.join(uploadsDir, filename);
      await writeFile(filepath, buffer);

      const variants: Array<{ path: string; url: string }> = [];
      let blurDataURL: string | undefined = undefined;
      try {
        const sharp = await import("sharp");
        const sizes = [320, 640, 1200];
        const base = path.parse(filename).name;

        try {
          const thumb = await sharp.default(buffer).resize({ width: 20 }).webp({ quality: 50 }).toBuffer();
          blurDataURL = `data:image/webp;base64,${thumb.toString("base64")}`;
        } catch (thumbErr) {
          console.warn("[UPLOAD] blurDataURL generation failed (dev):", (thumbErr as any)?.message || thumbErr);
        }

        for (const w of sizes) {
          const avifPath = path.join(uploadsDir, `${base}@${w}.avif`);
          const webpPath = path.join(uploadsDir, `${base}@${w}.webp`);
          const avifBuf = await sharp.default(buffer).resize({ width: w }).avif().toBuffer();
          const webpBuf = await sharp.default(buffer).resize({ width: w }).webp().toBuffer();
          await writeFile(avifPath, avifBuf);
          await writeFile(webpPath, webpBuf);
          variants.push({ path: avifPath, url: `/uploads/${encodeURIComponent(`${base}@${w}.avif`)}` });
          variants.push({ path: webpPath, url: `/uploads/${encodeURIComponent(`${base}@${w}.webp`)}` });
        }
      } catch (err) {
        console.warn("[UPLOAD] sharp processing skipped (dev):", (err as any)?.message || err);
      }

      // Return local URL and any generated variants + blurDataURL
      const url = `/uploads/${filename}`;
      const modelId = formData.get("modelId") as string | null;
      const alt = (formData.get("alt") as string) || undefined;
      if (modelId) {
        try {
          const created = await prisma.image.create({
            data: {
              url,
              alt,
              modelId,
              blurDataUrl: blurDataURL,
            },
          });
          return NextResponse.json({ success: true, url, filename, variants, blurDataURL, image: created }, { status: 201 });
        } catch (dbErr) {
          console.warn("[UPLOAD] failed to create image record (dev):", (dbErr as any)?.message || dbErr);
          return NextResponse.json({ success: true, url, filename, variants, blurDataURL }, { status: 201 });
        }
      }

      return NextResponse.json(
        {
          success: true,
          url,
          filename: filename,
          variants,
          blurDataURL,
        },
        { status: 201 },
      );
    }
  } catch (error: any) {
    console.error("[UPLOAD]", error);
    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 },
    );
  }
}
