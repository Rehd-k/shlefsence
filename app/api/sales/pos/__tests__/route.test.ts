import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth/session", () => ({
  getSessionFromRequest: vi.fn().mockResolvedValue({
    sub: "1",
    name: "Cashier",
    email: "c@test.com",
    role: "Sales",
    assignedLocation: "Hub",
  }),
}));

const lean = vi.fn();
vi.mock("@/lib/models/Product", () => ({
  default: {
    find: vi.fn(() => ({ sort: () => ({ lean }) })),
  },
}));

vi.mock("@/lib/models/Receipt", () => ({
  default: {
    create: vi.fn().mockResolvedValue({
      toObject: () => ({
        _id: { toString: () => "507f1f77bcf86cd799439011" },
        receiptNumber: "RCP-1",
        totalAmount: 100,
      }),
    }),
  },
}));

vi.mock("@/lib/models/StoreSettings", () => ({
  default: {
    findOne: vi.fn().mockReturnValue({
      lean: () =>
        Promise.resolve({ businessName: "ShelfSense", businessAddress: "Lagos" }),
    }),
  },
}));

import { GET, POST } from "@/app/api/sales/pos/route";

describe("/api/sales/pos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns empty catalog without seed", async () => {
    lean.mockResolvedValue([]);
    const res = await GET(new Request("http://localhost/api/sales/pos"));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });

  it("POST rejects invalid cart", async () => {
    const res = await POST(
      new Request("http://localhost/api/sales/pos", {
        method: "POST",
        body: JSON.stringify({ totalAmount: 10, items: [] }),
      })
    );
    expect(res.status).toBe(400);
  });

  it("POST creates receipt for valid cart", async () => {
    const res = await POST(
      new Request("http://localhost/api/sales/pos", {
        method: "POST",
        body: JSON.stringify({
          totalAmount: 100,
          items: [{ quantity: 1, product: { name: "OLED", sku: "S1" } }],
          paymentMethod: "Cash",
        }),
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
