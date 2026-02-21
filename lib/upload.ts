import { upload } from "@vercel/blob/client";

/**
 * Uploads a file directly to the cloud storage provider (Vercel Blob or AWS S3).
 * Bypasses the 4.5MB Next.js API route limits.
 * 
 * @param file The File object from an input element
 * @param isDownload Boolean indicating if the file should be placed in the "downloads/" folder
 * @returns An object containing the final public URL and other metadata
 */
export async function uploadFileDirectly(file: File, isDownload: boolean = false) {
  const uploadMode = process.env.NEXT_PUBLIC_UPLOAD_MODE || "blob";

  if (uploadMode === "s3") {
    // 1. Get AWS S3 presigned URL
    const presignRes = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        fileType: file.type || "application/octet-stream",
        isDownload
      }),
    });

    if (!presignRes.ok) {
        const errData = await presignRes.json().catch(() => ({}));
        throw new Error(errData.error || "Nie udało się wygenerować linku do uploadu S3");
    }

    const { presignedUrl, publicUrl, key } = await presignRes.json();

    // 2. Upload directly to AWS S3 using PUT
    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
    });

    if (!uploadRes.ok) {
      throw new Error("Błąd podczas bezpośredniego wgrywania pliku na S3");
    }

    return {
      url: publicUrl,
      filename: key,
    };
  } else {
    // Fallback to Vercel Blob
    // @vercel/blob/client automatically requests a token from `/api/upload/blob`
    // (We set the default handleUpload route to /api/upload/blob)
    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload/blob',
      clientPayload: isDownload ? "download" : undefined,
    });

    return {
      url: blob.url,
      filename: blob.pathname,
    };
  }
}
