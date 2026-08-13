import { describe, it, expect, vi, beforeEach } from "vitest";

const { lean, sort, find, connectToDatabase, requireTenantSession } = vi.hoisted(() => {
  const lean = vi.fn();
  const sort = vi.fn(() => ({ lean }));
  const find = vi.fn(() => ({ sort }));
  const connectToDatabase = vi.fn().mockResolvedValue(undefined);
  const requireTenantSession = vi.fn();
  return { lean, sort, find, connectToDatabase, requireTenantSession };
});

vi.mock("@/lib/db/mongodb", () => ({
  connectToDatabase,
}));

vi.mock("@/lib/auth/apiAuth", () => ({
  requireTenantSession,
  tenantFilter: (organizationId: string, extra: Record<string, unknown> = {}) => ({
    organizationId,
    ...extra,
  }),
  actorName: (s: { name?: string; email?: string }) => s.name || s.email || "System",
}));

vi.mock("@/lib/models/InventoryMovement", () => ({
  default: { find },
}));

import { GET } from "@/app/api/inventory/[id]/movements/route";

describe("GET /api/inventory/[id]/movements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectToDatabase.mockResolvedValue(undefined);
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

  it("returns empty list without seed fallback", async () => {
    lean.mockResolvedValue([]);
    const res = await GET(new Request("http://localhost/api/inventory/SKU-1/movements"), {
      params: Promise.resolve({ id: "SKU-1" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });

  it("returns 500 on DB error without fake success data", async () => {
    connectToDatabase.mockRejectedValueOnce(new Error("db down"));
    const res = await GET(new Request("http://localhost/api/inventory/SKU-1/movements"), {
      params: Promise.resolve({ id: "SKU-1" }),
    });
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.data).toBeUndefined();
  });
});
