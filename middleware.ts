import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const isDev = process.env.NODE_ENV === "development";

  const csp = `
    default-src 'self';
    script-src 'self'
      ${isDev ? "'unsafe-eval' 'unsafe-inline'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    connect-src 'self' ws: http://localhost:*;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: "/:path*",
};
