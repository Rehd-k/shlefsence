import { describe, it, expect, vi, beforeEach } from "vitest";

const { lean, find } = vi.hoisted(() => {
  const lean = vi.fn().mockResolvedValue([]);
  const find = vi.fn(() => ({
    sort: () => ({ lean }),
    lean,
  }));
  return { lean, find };
});

vi.mock("@/lib/db/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/models/Supplier", () => ({
  default: { find, countDocuments: vi.fn(), create: vi.fn() },
}));

import { GET, POST } from "@/app/api/suppliers/route";

describe("/api/suppliers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lean.mockResolvedValue([]);
  });

  it("GET returns empty list with zero KPIs", async () => {
    const res = await GET(new Request("http://localhost/api/suppliers"));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.kpis.averageDeliveryTime).toBe(0);
    expect(json.kpis.defectiveRate).toBe(0);
  });

  it("POST rejects missing name", async () => {
    const res = await POST(
      new Request("http://localhost/api/suppliers", {
        method: "POST",
        body: JSON.stringify({ code: "SUP-1" }),
      })
    );
    expect(res.status).toBe(400);
  });
});
