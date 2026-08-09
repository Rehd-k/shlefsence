import { NextResponse } from "next/server";

/**
 * Protects destructive seed endpoints.
 * - Blocked in production unless ALLOW_SEED_IN_PRODUCTION=true
 * - Always requires Authorization: Bearer ${SEED_SECRET}
 */
export function assertSeedAuthorized(req: Request): NextResponse | null {
  const isProduction = process.env.NODE_ENV === "production";
  const allowInProduction = process.env.ALLOW_SEED_IN_PRODUCTION === "true";

  if (isProduction && !allowInProduction) {
    return NextResponse.json(
      { success: false, error: "Seed endpoints are disabled in production" },
      { status: 403 }
    );
  }

  const seedSecret = process.env.SEED_SECRET;
  if (!seedSecret) {
    return NextResponse.json(
      { success: false, error: "SEED_SECRET is not configured" },
      { status: 503 }
    );
  }

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token || token !== seedSecret) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: valid SEED_SECRET bearer token required" },
      { status: 401 }
    );
  }

  return null;
}
