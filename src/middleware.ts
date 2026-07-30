import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "super-secret-key-change-me-in-production"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("app_session_token")?.value;

  let sessionUser: { role: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      sessionUser = { role: payload.role as string };
    } catch {
      sessionUser = null;
    }
  }

  const isProtected =
    pathname.startsWith("/super-admin") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/tenant");

  // 1. Khách chưa đăng nhập truy cập trang bảo vệ -> Redirect về /login
  if (!sessionUser && isProtected) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Người đã đăng nhập truy cập /login hoặc root / -> Redirect theo Role
  if (sessionUser && (pathname === "/login" || pathname === "/")) {
    let targetPath = "/tenant/dashboard";
    if (sessionUser.role === "SUPER_ADMIN") targetPath = "/super-admin/dashboard";
    else if (sessionUser.role === "OWNER") targetPath = "/admin/dashboard";

    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  // 3. Phân quyền Role Guards
  if (sessionUser) {
    if (pathname.startsWith("/super-admin") && sessionUser.role !== "SUPER_ADMIN") {
      const redirectPath = sessionUser.role === "OWNER" ? "/admin/dashboard" : "/tenant/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    if (pathname.startsWith("/admin") && sessionUser.role !== "OWNER") {
      const redirectPath = sessionUser.role === "SUPER_ADMIN" ? "/super-admin/dashboard" : "/tenant/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    if (pathname.startsWith("/tenant") && sessionUser.role !== "TENANT") {
      const redirectPath = sessionUser.role === "SUPER_ADMIN" ? "/super-admin/dashboard" : "/admin/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/super-admin/:path*", "/admin/:path*", "/tenant/:path*", "/login", "/"],
};
