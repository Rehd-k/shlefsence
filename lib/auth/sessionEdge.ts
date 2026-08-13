import type { UserRole } from "@/lib/auth/types";

export const SESSION_COOKIE = "shelfsense_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  assignedLocation: string;
  organizationId: string;
  exp?: number;
  iat?: number;
}

/** Shared secret bytes for HS256 — Edge-safe (no Node APIs). */
export function getAuthSecretBytes(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET environment variable is required in production");
    }
    return new TextEncoder().encode("dev-only-shelfsense-auth-secret-change-me");
  }
  return new TextEncoder().encode(secret);
}

function base64UrlToBytes(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToJson<T>(bytes: Uint8Array): T {
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

/**
 * Edge-safe HS256 JWT verify using Web Crypto only.
 * Used by middleware so the Edge bundle never imports `jose`.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    const header = bytesToJson<{ alg?: string }>(base64UrlToBytes(headerB64));
    if (header.alg !== "HS256") return null;

    const key = await crypto.subtle.importKey(
      "raw",
      getAuthSecretBytes() as BufferSource,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlToBytes(signatureB64);
    const valid = await crypto.subtle.verify("HMAC", key, signature as BufferSource, data);
    if (!valid) return null;

    const payload = bytesToJson<Record<string, unknown>>(base64UrlToBytes(payloadB64));

    if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
      return null;
    }

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.organizationId !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.assignedLocation !== "string"
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role as SessionPayload["role"],
      assignedLocation: payload.assignedLocation,
      organizationId: payload.organizationId,
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
      iat: typeof payload.iat === "number" ? payload.iat : undefined,
    };
  } catch {
    return null;
  }
}
