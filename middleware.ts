// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

    // Public route patterns
  const publicRoutes = ['/login', '/register', '/'];

  // Automatically allow everything inside /public/*
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/images') || // <- dynamic public route allowance
    pathname.startsWith('/api')      // allow API routes
  ) {
    return NextResponse.next();
  }
  
  // Check auth token
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    // Middleware runs for all routes except:
    // - Next.js internals
    // - public routes
    "/((?!_next/static|_next/image|favicon.ico|public|about|admission|learning|newsAndEvents|contact).*)",
  ],
};
