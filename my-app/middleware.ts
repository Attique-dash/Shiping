import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth"; // use your JWT verify util

// Decode JWT payload (fallback if verifyToken fails)
function base64UrlDecode(input: string): string {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = input.length % 4;
  if (pad) input += "=".repeat(4 - pad);
  const raw = Uint8Array.from(atob(input), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(raw);
}

function getRoleFromToken(token: string | undefined): string | null {
  if (!token) return null;
  try {
    // prefer verifyToken if available
    const payload = verifyToken(token);
    if (payload?.role) return payload.role;
  } catch {}
  // fallback decode
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = base64UrlDecode(parts[1]);
    const payload = JSON.parse(json) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;
  const role = getRoleFromToken(token);
  const isAuth = Boolean(token);

  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg");

  const isAuthPage = ["/login", "/register", "/admin/login"].includes(pathname);
  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/customer");
  const isWarehouseRoute = pathname.startsWith("/warehouse");

  // ✅ Allow static assets always
  if (isStatic) return NextResponse.next();

  // 🧠 If not authenticated → redirect to login
  if (!isAuth && !isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?redirect=${encodeURIComponent(pathname + (search || ""))}`;
    return NextResponse.redirect(url);
  }

  // ✅ If already authenticated, prevent going back to /login or /register
  if (isAuth && isAuthPage) {
    const url = req.nextUrl.clone();
    if (role === "admin") url.pathname = "/admin";
    else if (role === "warehouse") url.pathname = "/warehouse";
    else url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // ✅ Role-based protection
  if (isAuth) {
    if (role === "admin" && (isDashboardRoute || isWarehouseRoute)) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    if (role === "customer" && (isAdminRoute || isWarehouseRoute)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (role === "warehouse" && (isAdminRoute || isDashboardRoute)) {
      const url = req.nextUrl.clone();
      url.pathname = "/warehouse";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // match all except static
  matcher: ["/((?!_next|favicon|images).*)"],
};
