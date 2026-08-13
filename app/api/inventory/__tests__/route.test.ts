import { describe, it, expect, vi, beforeEach } from "vitest";

const { lean, sort, find, create, requireTenantSession } = vi.hoisted(() => {
  const lean = vi.fn();
  const sort = vi.fn(() => ({ lean }));
  const find = vi.fn(() => ({ sort }));
  const create = vi.fn();
  const requireTenantSession = vi.fn();
  return { lean, sort, find, create, requireTenantSession };
});

vi.mock("@/lib/db/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth/apiAuth", () => ({
  requireTenantSession,
  tenantFilter: (organizationId: string, extra: Record<string, unknown> = {}) => ({
    organizationId,
    ...extra,
  }),
  actorName: (s: { name?: string; email?: string }) => s.name || s.email || "System",
}));

vi.mock("@/lib/models/InventoryItem", () => ({
  default: { find, create },
}));

vi.mock("@/lib/models/InventoryMovement", () => ({
  default: { create: vi.fn().mockResolvedValue({}) },
}));

import { GET, POST } from "@/app/api/inventory/route";

describe("/api/inventory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantSession.mockResolvedValue({
      session: {
        sub: "u1",
        email: "a@b.com",
        name: "Admin",
        role: "Admin",
        assignedLocation: "Main Hub",
        organizationId: "aaaaaaaaaaaaaaaaaaaaaaaa",
      },
      organizationId: "aaaaaaaaaaaaaaaaaaaaaaaa",
    });
  });

  it("GET returns empty array (no seed fallback)", async () => {
    lean.mockResolvedValue([]);
    const res = await GET(new Request("http://localhost/api/inventory"));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });

  it("POST validates payload", async () => {
    const res = await POST(
      new Request("http://localhost/api/inventory", {
        method: "POST",
        body: JSON.stringify({ product: "x" }),
      })
    );
    expect(res.status).toBe(400);
  });
});
