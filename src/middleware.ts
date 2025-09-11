import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // Token yo'q bo'lsa
  if (!token) {
    if (req.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login/admin", req.url));
    }
    if (req.nextUrl.pathname.startsWith("/user")) {
      return NextResponse.redirect(new URL("/login/user", req.url));
    }
    return NextResponse.next();
  }

  try {
    const decoded: any = jwt.decode(token);

    // Admin routelarini tekshirish
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (decoded.role !== "admin" && decoded.role !== "super-admin") {
        return NextResponse.redirect(new URL("/login/admin", req.url));
      }
    }

    // User routelarini tekshirish
    if (req.nextUrl.pathname.startsWith("/user")) {
      if (decoded.role !== "user") {
        return NextResponse.redirect(new URL("/login/user", req.url));
      }
    }
  } catch (err) {
    console.error("JWT decode error:", err);
    return NextResponse.redirect(new URL("/login/user", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
