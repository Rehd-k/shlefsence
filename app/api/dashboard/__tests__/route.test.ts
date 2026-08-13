import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireTenantSession } = vi.hoisted(() => ({
  requireTenantSession: vi.fn(),
}));

const chain = vi.hoisted(() => {
  const lean = vi.fn().mockResolvedValue([]);
  const limit = vi.fn(() => ({ lean }));
  const sort = vi.fn(() => ({ lean, limit }));
  const select = vi.fn(() => ({ lean }));
  const find = vi.fn(() => ({ lean, sort, select, limit }));
  return { lean, limit, sort, select, find };
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

vi.mock("@/lib/models/Invoice", () => ({
  default: { find: chain.find },
}));
vi.mock("@/lib/models/Payment", () => ({
  default: { find: chain.find },
}));
vi.mock("@/lib/models/InventoryItem", () => ({
  default: { find: chain.find },
}));
vi.mock("@/lib/models/Supplier", () => ({
  default: { find: chain.find },
}));
vi.mock("@/lib/models/PurchaseOrder", () => ({
  default: { find: chain.find },
}));
vi.mock("@/lib/models/WarrantyClaim", () => ({
  default: { find: chain.find, countDocuments: vi.fn().mockResolvedValue(0) },
}));
vi.mock("@/lib/models/Receipt", () => ({
  default: { find: chain.find },
}));
vi.mock("@/lib/models/WholesaleCustomer", () => ({
  default: { find: chain.find },
}));

import { GET } from "@/app/api/dashboard/route";

describe("GET /api/dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chain.lean.mockResolvedValue([]);
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

  it("returns success shape on empty DB", async () => {
    const res = await GET(new Request("http://localhost/api/dashboard"));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.metrics).toBeDefined();
    expect(Array.isArray(json.data.dailySales)).toBe(true);
  });
});
