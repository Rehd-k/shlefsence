import { describe, it, expect, vi, beforeEach } from "vitest";

const { lean, sort, find, create } = vi.hoisted(() => {
  const lean = vi.fn();
  const sort = vi.fn(() => ({ lean }));
  const find = vi.fn(() => ({ sort }));
  const create = vi.fn();
  return { lean, sort, find, create };
});

vi.mock("@/lib/db/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/models/Invoice", () => ({
  default: { find, create },
}));

import { GET, POST } from "@/app/api/sales/invoices/route";

describe("/api/sales/invoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns empty list", async () => {
    lean.mockResolvedValue([]);
    const res = await GET(new Request("http://localhost/api/sales/invoices"));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });

  it("POST creates invoice with valid payload", async () => {
    create.mockResolvedValue({
      toObject: () => ({
        _id: { toString: () => "507f1f77bcf86cd799439011" },
        customerName: "Acme",
      }),
    });
    const res = await POST(
      new Request("http://localhost/api/sales/invoices", {
        method: "POST",
        body: JSON.stringify({ customerName: "Acme", totalAmount: 10 }),
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
