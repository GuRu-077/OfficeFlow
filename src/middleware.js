import { NextResponse } from "next/server";
import { verifyMockToken } from "./utils/auth";

// Paths that do not require authentication
const publicPaths = ["/api/auth/login"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // We only want to protect /api routes for now using the mock token
  if (pathname.startsWith("/api/")) {
    if (publicPaths.includes(pathname)) {
      return NextResponse.next();
    }

    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing token" },
        { status: 401 },
      );
    }

    const payload = verifyMockToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or expired token" },
        { status: 401 },
      );
    }

    // Pass the user info via headers for the API routes to use if needed
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Allow all other requests (like page renders, static assets)
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
