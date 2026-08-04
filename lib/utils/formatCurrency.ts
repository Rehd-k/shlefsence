/**
 * Utility for formatting monetary amounts in Nigerian Naira (₦).
 */
export function formatNaira(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "₦0.00";
  }
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNairaCompact(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "₦0";
  }
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(1)}k`;
  }
  return `₦${amount.toFixed(0)}`;
}
