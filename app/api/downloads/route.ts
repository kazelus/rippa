import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const modelId = formData.get("modelId") as string; // Optional
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

    // Create downloads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public/downloads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name || fileName;
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    const newFileName = `${nameWithoutExt}-${timestamp}${ext}`;
    const filePath = path.join(uploadsDir, newFileName);

    // Save file
    const bytes = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(bytes));

    // Return file info
    const fileUrl = `/downloads/${newFileName}`;
    const fileType = ext.toLowerCase().replace(".", "");
    const fileSize = file.size;

    return NextResponse.json(
      {
        url: fileUrl,
        name: originalName,
        fileType,
        fileSize,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error uploading download:", error);
    return NextResponse.json(
      { error: "Błąd przy przesyłaniu pliku" },
      { status: 500 },
    );
  }
}
