import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, objectIdSchema } from "@/lib/validators/auth";

describe("auth validators", () => {
  it("accepts valid login payload", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "secret" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "nope", password: "secret" });
    expect(result.success).toBe(false);
  });

  it("requires businessName for registration", () => {
    const missingBiz = registerSchema.safeParse({
      name: "Ada",
      email: "a@b.com",
      password: "Password1",
    });
    expect(missingBiz.success).toBe(false);

    const ok = registerSchema.safeParse({
      name: "Ada",
      email: "a@b.com",
      password: "Password1",
      businessName: "Ada Parts",
    });
    expect(ok.success).toBe(true);
  });

  it("validates ObjectId", () => {
    expect(objectIdSchema.safeParse("507f1f77bcf86cd799439011").success).toBe(true);
    expect(objectIdSchema.safeParse("bad-id").success).toBe(false);
  });
});
