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

      const putCmd = new PutObjectCommand({
        Bucket: s3Bucket,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read",
      });

      await s3.send(putCmd);

      const url = `https://${s3Bucket}.s3.${process.env.S3_REGION}.amazonaws.com/${encodeURIComponent(filename)}`;
      return NextResponse.json({ success: true, url, filename }, { status: 201 });
    }

    // Check if we have Blob token (Vercel Blob) or use local storage (development)
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (blobToken) {
      // Production (Vercel): Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
      });

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

      // Write file
      const filepath = path.join(uploadsDir, filename);
      await writeFile(filepath, buffer);

      // Return local URL
      return NextResponse.json(
        {
          success: true,
          url: `/uploads/${filename}`,
          filename: filename,
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
