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

vi.mock("@/lib/auth/session", () => ({
  getSessionFromRequest: vi.fn().mockResolvedValue({ name: "Tester", sub: "1" }),
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
