let cachedSymbol: string | null = null;

function getCurrencySymbol(): string {
  if (cachedSymbol) return cachedSymbol;

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("shelfsense_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.currencyDefault) {
          cachedSymbol = String(parsed.currencyDefault);
          return cachedSymbol as string;
        }
      }
    } catch {
      // Ignore errors in SSR or JSON parsing
    }
  }
  return "₦";
}

/** Call after settings load to avoid SSR/client currency mismatches. */
export function setCurrencySymbolCache(symbol: string) {
  cachedSymbol = symbol;
}

/**
 * Utility for formatting monetary amounts dynamically based on system settings.
 * Uses a stable default (₦) during SSR to avoid hydration mismatches.
 */
export function formatCurrency(amount: number): string {
  const symbol = getCurrencySymbol();
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0.00`;
  }
  const locale = symbol === "₦" ? "en-NG" : "en-US";
  return `${symbol}${amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCurrencyCompact(amount: number): string {
  const symbol = getCurrencySymbol();
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0`;
  }
  if (amount >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}k`;
  }
  return `${symbol}${amount.toFixed(0)}`;
}

// Fallback exports for backward compatibility
export { formatCurrency as formatNaira, formatCurrencyCompact as formatNairaCompact };
