import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/auth/types";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  getAuthSecretBytes,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/auth/sessionEdge";

export {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifySessionToken,
  type SessionPayload,
};

export async function createSessionToken(payload: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assignedLocation: string;
  organizationId: string;
}): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
    assignedLocation: payload.assignedLocation,
    organizationId: payload.organizationId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getAuthSecretBytes());
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
