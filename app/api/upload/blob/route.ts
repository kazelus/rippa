import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import path from "path";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname: string,
        clientPayload?: string | null,
      ) => {
        // Authenticate users before generating a token
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
          throw new Error("Unauthorized");
        }

        // Generate a new clean pathname to avoid collisions
        const timestamp = Date.now();
        const ext = path.extname(pathname);
        const nameWithoutExt = path.basename(pathname, ext);
        
        let customPathname = `${nameWithoutExt}-${timestamp}${ext}`;

        // If client Payload is 'download', route to downloads/ directory
        if (clientPayload === "download") {
            customPathname = `downloads/${customPathname}`;
        }
        
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
            "application/zip",
            "application/x-zip-compressed",
            "application/octet-stream",
            "text/plain",
          ],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
          pathname: customPathname,
          // Limit to 50MB per file for Blob
          maximumSizeInBytes: 50 * 1024 * 1024,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Blob upload verified. No database updates are strictly required here 
        // because the Prisma record is created when saving the Model itself,
        // or through the new/edit frontend calling the API explicitly afterwards.
        console.log("Blob upload completed", blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
