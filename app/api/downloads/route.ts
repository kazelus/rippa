import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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
      console.error("[DOWNLOAD_UPLOAD] Failed to parse FormData:", err);
      return NextResponse.json(
        {
          error: "Failed to parse form data. The request may be too large.",
        },
        { status: 413 },
      );
    }

    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Limit file size to 20MB
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Plik jest za duży (maks. 20MB)" },
        { status: 413 },
      );
    }

    const timestamp = Date.now();
    const originalName = file.name || fileName;
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    const newFileName = `${nameWithoutExt}-${timestamp}${ext}`;

    const fileType = ext.toLowerCase().replace(".", "");
    const fileSize = file.size;

    // Prefer S3 if configured
    const s3Bucket = process.env.S3_BUCKET;
    if (s3Bucket) {
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

      const putCmd = new PutObjectCommand({
        Bucket: s3Bucket,
        Key: `downloads/${newFileName}`,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
        ACL: "public-read",
      });

      await s3.send(putCmd);

      const url = `https://${s3Bucket}.s3.${process.env.S3_REGION}.amazonaws.com/downloads/${encodeURIComponent(newFileName)}`;

      return NextResponse.json(
        {
          url,
          name: originalName,
          fileType,
          fileSize,
        },
        { status: 201 },
      );
    }

    // Check if we have Blob token (Vercel Blob)
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (blobToken) {
      const blob = await put(`downloads/${newFileName}`, file, {
        access: "public",
      });

      return NextResponse.json(
        {
          url: blob.url,
          name: originalName,
          fileType,
          fileSize,
        },
        { status: 201 },
      );
    } else {
      // Development: Save to local filesystem
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "public", "downloads");
      await mkdir(uploadsDir, { recursive: true });

      const filepath = path.join(uploadsDir, newFileName);
      await writeFile(filepath, buffer);

      const url = `/downloads/${newFileName}`;

      return NextResponse.json(
        {
          url,
          name: originalName,
          fileType,
          fileSize,
        },
        { status: 201 },
      );
    }
  } catch (error: any) {
    console.error("[DOWNLOAD_UPLOAD] Error uploading download:", error);
    return NextResponse.json(
      { error: "Błąd przy przesyłaniu pliku" },
      { status: 500 },
    );
  }
}
