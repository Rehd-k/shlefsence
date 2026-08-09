import type { DashboardHealthMetrics } from "@/lib/types/dashboard";

/** Zeroed metrics — never seed fake SKUs or revenue. */
export const EMPTY_DASHBOARD_METRICS: DashboardHealthMetrics = {
  revenueToday: { amount: 0, trendPercentage: 0, comparedTo: "yesterday", target: 0 },
  revenueMonth: { amount: 0, trendPercentage: 0, comparedTo: "last month", target: 0 },
  grossProfit: { amount: 0, marginPercentage: 0, trendPercentage: 0 },
  inventoryValue: { totalValue: 0, totalCost: 0, potentialProfit: 0 },
  outstandingDebts: { amount: 0, overdueAmount: 0, customerCount: 0 },
  supplierPayables: { amount: 0, dueIn7Days: 0, supplierCount: 0 },
  lowStockAlerts: { count: 0, criticalCount: 0 },
  outOfStockItems: { count: 0, lostRevenueEst: 0 },
  pendingPOs: { count: 0, totalValue: 0, expectedToday: 0 },
  awaitingDispatch: { count: 0, urgentCount: 0, totalValue: 0 },
  warrantyClaims: { count: 0, pendingInspection: 0, approvedRate: 0 },
  recentSales: { countToday: 0, avgOrderValue: 0 },
  recentPurchases: { countThisWeek: 0, totalSpend: 0 },
};
