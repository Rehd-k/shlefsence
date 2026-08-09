import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/auth/types";

export const SESSION_COOKIE = "shelfsense_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload extends JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  assignedLocation: string;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET environment variable is required in production");
    }
    return new TextEncoder().encode("dev-only-shelfsense-auth-secret-change-me");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assignedLocation: string;
}): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
    assignedLocation: payload.assignedLocation,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionFromRequest(req: Request): Promise<SessionPayload | null> {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  const token = match?.[1];
  if (!token) return null;
  return verifySessionToken(decodeURIComponent(token));
}

export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}
