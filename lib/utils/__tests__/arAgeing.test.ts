import { describe, it, expect } from "vitest";
import { computeArAgeing } from "@/lib/utils/arAgeing";
import type { IInvoice } from "@/lib/types/sales";

function makeInvoice(partial: Partial<IInvoice> & { balanceDue: number; dueDate: string }): IInvoice {
  return {
    id: "1",
    invoiceNumber: "INV-1",
    orderNumber: "ORD-1",
    customerName: "Acme",
    customerType: "Wholesale",
    items: [],
    subtotal: 0,
    tax: 0,
    totalAmount: partial.balanceDue,
    paidAmount: 0,
    balanceDue: partial.balanceDue,
    status: "Unpaid",
    paymentMethod: "Bank Transfer",
    issueDate: partial.dueDate,
    dueDate: partial.dueDate,
    createdAt: partial.dueDate,
    ...partial,
  } as IInvoice;
}

describe("computeArAgeing", () => {
  const now = new Date("2026-08-09T12:00:00Z");

  it("returns zeros for empty list", () => {
    expect(computeArAgeing([], now)).toEqual({
      current: 0,
      days31to60: 0,
      days61to90: 0,
      overdue90Plus: 0,
      totalOutstanding: 0,
    });
  });

  it("buckets current (0-30)", () => {
    const invoices = [makeInvoice({ balanceDue: 100, dueDate: "2026-08-01" })];
    const result = computeArAgeing(invoices, now);
    expect(result.current).toBe(100);
    expect(result.totalOutstanding).toBe(100);
  });

  it("buckets 31-60, 61-90, and 90+", () => {
    const invoices = [
      makeInvoice({ balanceDue: 10, dueDate: "2026-07-01" }), // ~39 days
      makeInvoice({ balanceDue: 20, dueDate: "2026-06-01" }), // ~69 days
      makeInvoice({ balanceDue: 30, dueDate: "2026-04-01" }), // ~130 days
    ];
    const result = computeArAgeing(invoices, now);
    expect(result.days31to60).toBe(10);
    expect(result.days61to90).toBe(20);
    expect(result.overdue90Plus).toBe(30);
    expect(result.totalOutstanding).toBe(60);
  });

  it("ignores zero/negative balances", () => {
    const invoices = [makeInvoice({ balanceDue: 0, dueDate: "2026-01-01" })];
    expect(computeArAgeing(invoices, now).totalOutstanding).toBe(0);
  });
});
