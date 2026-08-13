import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/sessionEdge";

const PUBLIC_PAGE_PATHS = ["/login", "/register"];
const PUBLIC_API_PREFIXES = ["/api/auth/login", "/api/auth/register", "/api/auth/logout", "/api/auth/me"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PAGE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (PUBLIC_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  // Seed routes use SEED_SECRET bearer auth, not session cookies
  if (pathname === "/api/seed" || pathname.startsWith("/api/inventory/seed")) {
    return true;
  }
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets and Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (isPublicPath(pathname)) {
    // Redirect authenticated users away from login/register
    if (session && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("x-user-id", session.sub);
  response.headers.set("x-user-role", String(session.role));
  response.headers.set("x-user-name", encodeURIComponent(session.name));
  if (session.organizationId) {
    response.headers.set("x-organization-id", session.organizationId);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
