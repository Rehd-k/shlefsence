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

vi.mock("@/lib/models/Product", () => ({
  default: { find, create },
}));

import { GET, POST } from "@/app/api/products/route";

describe("/api/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns empty array for empty collection", async () => {
    lean.mockResolvedValue([]);
    const res = await GET(new Request("http://localhost/api/products"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });

  it("POST rejects invalid payload", async () => {
    const res = await POST(
      new Request("http://localhost/api/products", {
        method: "POST",
        body: JSON.stringify({ brand: "Apple" }),
      })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("POST creates product with valid payload", async () => {
    create.mockResolvedValue({
      toObject: () => ({
        _id: { toString: () => "507f1f77bcf86cd799439011" },
        sku: "SKU-1",
        name: "OLED",
      }),
    });
    const res = await POST(
      new Request("http://localhost/api/products", {
        method: "POST",
        body: JSON.stringify({ sku: "SKU-1", name: "OLED" }),
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.sku).toBe("SKU-1");
  });
});
