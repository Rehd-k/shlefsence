import { NextResponse } from "next/server";
import { getSessionFromRequest, unauthorizedResponse, type SessionPayload } from "@/lib/auth/session";

export async function requireSession(
  req: Request
): Promise<{ session: SessionPayload } | { error: NextResponse }> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return { error: unauthorizedResponse() };
  }
  return { session };
}

/** Require a valid session that includes a tenant organizationId. */
export async function requireTenantSession(
  req: Request
): Promise<
  | { session: SessionPayload; organizationId: string }
  | { error: NextResponse }
> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return { error: unauthorizedResponse() };
  }
  if (!session.organizationId) {
    return {
      error: NextResponse.json(
        { success: false, error: "Organization context required. Please sign in again." },
        { status: 401 }
      ),
    };
  }
  return { session, organizationId: session.organizationId };
}

export function actorName(session: SessionPayload): string {
  return session.name || session.email;
}

/** Build a Mongo filter that always scopes to the session organization. */
export function tenantFilter(
  organizationId: string,
  extra: Record<string, unknown> = {}
): Record<string, unknown> {
  return { organizationId, ...extra };
}
