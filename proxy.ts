import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDev = process.env.NODE_ENV === "development";
  const apiProxy = process.env.NEXT_PUBLIC_API_PROXY_URL ?? "http://localhost:8000";

  const csp = `
    default-src 'self';
    script-src 'self' ${isDev ? "'unsafe-inline' 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    connect-src 'self' ${apiProxy} http://localhost:8000 http://127.0.0.1:8000 ws: wss:;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  let response: NextResponse;

  if (pathname.startsWith("/api/") && !pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = `${pathname}/`;
    response = NextResponse.rewrite(url);
  } else {
    response = NextResponse.next();
  }

  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: "/:path*",
};
