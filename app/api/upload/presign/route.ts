import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";

// Endpoint do generowania Presigned URLs dla Direct Upload AWS S3
export async function POST(req: NextRequest) {
  try {
    // 1. Ochrona endpointu - tylko autoryzowani "administratorzy" mogą wgrywać pliki S3
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { filename, fileType, isDownload } = body;

    if (!filename || !fileType) {
      return NextResponse.json(
        { error: "Brak zadeklarowanej nazwy pliku lub typu MIME" },
        { status: 400 },
      );
    }

    // 2. Weryfikacja konfiguracji AWS
    const s3Bucket = process.env.S3_BUCKET;
    if (!s3Bucket) {
      return NextResponse.json(
        { error: "AWS S3 nie jest skonfigurowane na tym serwerze." },
        { status: 501 },
      );
    }

    const s3 = new S3Client({
      region: process.env.S3_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
          }
        : undefined,
    });

    // 3. Oczyszczanie nazwy i wyznaczanie struktury katalogów
    const timestamp = Date.now();
    const ext = path.extname(filename);
    const nameWithoutExt = path.basename(filename, ext);
    // Jeśli plik wędruje do /downloads dodaj ten prefiks
    const finalFilename = `${nameWithoutExt}-${timestamp}${ext}`;
    const key = isDownload ? `downloads/${finalFilename}` : finalFilename;

    const putCmd = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: key,
      ContentType: fileType,
      ACL: "public-read",
    });

    // 4. Wygenerowanie specjalnego tokenu ważnego np. 10 minut
    const presignedUrl = await getSignedUrl(s3, putCmd, { expiresIn: 600 });
    
    // Zwróć gotowy presigned URL wraz z przygotowanym publicznym pełnym URL dostępnym po uploadzie 
    return NextResponse.json({
        presignedUrl,
        publicUrl: `https://${s3Bucket}.s3.${process.env.S3_REGION}.amazonaws.com/${encodeURIComponent(key)}`,
        key,
        finalFilename
    }, { status: 200 });

  } catch (error: any) {
    console.error("[PRESIGN_UPLOAD]", error);
    return NextResponse.json(
      { error: "Błąd przy generowaniu linku S3 (Presigned SDK)" },
      { status: 500 },
    );
  }
}
