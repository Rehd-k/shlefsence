import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

const ORG_A = "aaaaaaaaaaaaaaaaaaaaaaaa";
const ORG_B = "bbbbbbbbbbbbbbbbbbbbbbbb";
const SUPPLIER_ID = "507f1f77bcf86cd7994390bb";

const { findOne, requireTenantSession } = vi.hoisted(() => ({
  findOne: vi.fn(),
  requireTenantSession: vi.fn(),
}));

vi.mock("@/lib/db/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth/apiAuth", () => ({
  requireTenantSession,
  tenantFilter: (organizationId: string, extra: Record<string, unknown> = {}) => ({
    organizationId,
    ...extra,
  }),
  actorName: () => "Tester",
}));

vi.mock("@/lib/models/Supplier", () => ({
  default: {
    findOne: (...args: unknown[]) => {
      findOne(...args);
      return { lean: () => Promise.resolve(null) };
    },
  },
}));

vi.mock("@/lib/models/PurchaseOrder", () => ({
  default: {
    find: vi.fn(() => ({ sort: () => ({ lean: () => Promise.resolve([]) }) })),
  },
}));

vi.mock("@/lib/models/WarrantyClaim", () => ({
  default: {
    find: vi.fn(() => ({ sort: () => ({ lean: () => Promise.resolve([]) }) })),
  },
}));

import { GET } from "@/app/api/suppliers/[id]/route";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";
import { tenantFilter } from "@/lib/auth/apiAuth";

describe("tenant isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantSession.mockResolvedValue({
      session: {
        sub: "user-a",
        email: "a@org-a.com",
        name: "Org A Admin",
        role: "Admin",
        assignedLocation: "Main Hub",
        organizationId: ORG_A,
      },
      organizationId: ORG_A,
    });
  });

  it("tenantFilter always includes organizationId", () => {
    expect(tenantFilter(ORG_A, { sku: "X" })).toEqual({ organizationId: ORG_A, sku: "X" });
  });

  it("GET supplier by id scopes query to session organization", async () => {
    findOne.mockResolvedValue(null);

    const res = await GET(new Request(`http://localhost/api/suppliers/${SUPPLIER_ID}`), {
      params: Promise.resolve({ id: SUPPLIER_ID }),
    });

    expect(findOne).toHaveBeenCalledWith({ _id: SUPPLIER_ID, organizationId: ORG_A });
    expect(res.status).toBe(404);
  });

  it("Org A query never uses Org B id from client intent", async () => {
    findOne.mockResolvedValue(null);
    await GET(
      new Request(`http://localhost/api/suppliers/${SUPPLIER_ID}?organizationId=${ORG_B}`),
      { params: Promise.resolve({ id: SUPPLIER_ID }) }
    );
    expect(findOne).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: ORG_A })
    );
    expect(findOne).not.toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: ORG_B })
    );
  });

  it("JWT session includes organizationId", async () => {
    const token = await createSessionToken({
      id: "507f1f77bcf86cd799439011",
      email: "a@b.com",
      name: "A",
      role: "Admin",
      assignedLocation: "Main Hub",
      organizationId: ORG_A,
    });
    const session = await verifySessionToken(token);
    expect(session?.organizationId).toBe(ORG_A);
  });
});

describe("requireTenantSession", () => {
  it("returns 401 when organizationId is missing from session", async () => {
    vi.resetModules();
    vi.doUnmock("@/lib/auth/apiAuth");
    vi.doMock("@/lib/auth/session", () => ({
      getSessionFromRequest: vi.fn().mockResolvedValue({
        sub: "u1",
        email: "a@b.com",
        name: "A",
        role: "Admin",
        assignedLocation: "Main Hub",
      }),
      unauthorizedResponse: (message = "Unauthorized") =>
        NextResponse.json({ success: false, error: message }, { status: 401 }),
    }));

    const { requireTenantSession: requireTenant } = await import("@/lib/auth/apiAuth");
    const result = await requireTenant(new Request("http://localhost/api/products"));
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(401);
    }
  });
});
