import { describe, it, expect, beforeEach } from "vitest";
import {
  formatCurrency,
  formatCurrencyCompact,
  setCurrencySymbolCache,
} from "@/lib/utils/formatCurrency";

describe("formatCurrency", () => {
  beforeEach(() => {
    setCurrencySymbolCache("₦");
  });

  it("formats valid amounts with two decimals", () => {
    expect(formatCurrency(1234.5)).toBe("₦1,234.50");
  });

  it("handles null/NaN/undefined as zero", () => {
    expect(formatCurrency(NaN)).toBe("₦0.00");
    expect(formatCurrency(null as unknown as number)).toBe("₦0.00");
    expect(formatCurrency(undefined as unknown as number)).toBe("₦0.00");
  });

  it("formats compact amounts", () => {
    expect(formatCurrencyCompact(1500)).toBe("₦1.5k");
    expect(formatCurrencyCompact(2_500_000)).toBe("₦2.5M");
    expect(formatCurrencyCompact(42)).toBe("₦42");
  });

  it("respects currency cache override", () => {
    setCurrencySymbolCache("$");
    expect(formatCurrency(10)).toContain("$");
  });
});
