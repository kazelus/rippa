import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware to initialize Prisma
export function middleware(request: NextRequest) {
  // Let the request pass through
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
