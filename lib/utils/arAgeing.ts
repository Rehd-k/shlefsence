import type { ARAgeingSummary, IInvoice } from "@/lib/types/sales";

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Compute AR ageing buckets from unpaid invoice balances.
 * Age is days past dueDate (or issueDate if dueDate missing).
 */
export function computeArAgeing(invoices: IInvoice[], now = new Date()): ARAgeingSummary {
  const summary: ARAgeingSummary = {
    current: 0,
    days31to60: 0,
    days61to90: 0,
    overdue90Plus: 0,
    totalOutstanding: 0,
  };

  for (const inv of invoices) {
    const balance = Number(inv.balanceDue) || 0;
    if (balance <= 0) continue;

    summary.totalOutstanding += balance;

    const dueRaw = inv.dueDate || inv.issueDate;
    const due = dueRaw ? new Date(dueRaw) : now;
    const age = Math.max(0, daysBetween(due, now));

    if (age <= 30) summary.current += balance;
    else if (age <= 60) summary.days31to60 += balance;
    else if (age <= 90) summary.days61to90 += balance;
    else summary.overdue90Plus += balance;
  }

  return summary;
}
