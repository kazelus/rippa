import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

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
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    // Ensure uploads directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Save file
    const filepath = path.join(uploadsDir, filename);
    const buffer = await file.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(buffer));

    // Return URL
    const url = `/uploads/${filename}`;

    return NextResponse.json(
      {
        success: true,
        url,
        filename,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[UPLOAD]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
