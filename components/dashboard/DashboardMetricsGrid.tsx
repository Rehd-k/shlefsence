"use client";

import React from "react";
import { DashboardHealthMetrics } from "@/lib/types/dashboard";
import {
  DollarSign,
  TrendingUp,
  PieChart,
  Boxes,
  Users,
  Building2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Truck,
  ShieldCheck,
  ShoppingBag,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";
import { formatCurrency } from "@/lib/utils/formatCurrency";

interface DashboardMetricsGridProps {
  metrics: DashboardHealthMetrics;
  onMetricClick?: (metricKey: string) => void;
}

export const DashboardMetricsGrid: React.FC<DashboardMetricsGridProps> = ({
  metrics,
  onMetricClick,
}) => {

  return (
    <div className="space-y-4">
      {/* Top Header Label */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span>Enterprise Health Signals</span>
          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono font-semibold">
            13 Real-time Indicators
          </span>
        </h2>
      </div>

      {/* Row 1: Primary Financial Health Cards (6 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Revenue Today */}
        <div
          onClick={() => onMetricClick?.("revenueToday")}
          className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
              Revenue Today
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(metrics.revenueToday.amount)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3 stroke-[3]" />+{metrics.revenueToday.trendPercentage}%
              </span>
              <span className="text-[10px] text-slate-400 truncate">{metrics.revenueToday.comparedTo}</span>
            </div>
          </div>
        </div>

        {/* 2. Revenue This Month */}
        <div
          onClick={() => onMetricClick?.("revenueMonth")}
          className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
              Revenue Month
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(metrics.revenueMonth.amount)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3 stroke-[3]" />+{metrics.revenueMonth.trendPercentage}%
              </span>
              <span className="text-[10px] text-slate-400 truncate">vs target</span>
            </div>
          </div>
        </div>

        {/* 3. Gross Profit */}
        <div
          onClick={() => onMetricClick?.("grossProfit")}
          className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
              Gross Profit
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(metrics.grossProfit.amount)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded">
                {metrics.grossProfit.marginPercentage}% Margin
              </span>
              <span className="text-[10px] text-slate-400 truncate">+{metrics.grossProfit.trendPercentage}%</span>
            </div>
          </div>
        </div>

        {/* 4. Inventory Value */}
        <div
          onClick={() => onMetricClick?.("inventoryValue")}
          className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
              Inventory Value
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(metrics.inventoryValue.totalValue)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                Cost: {formatCurrency(metrics.inventoryValue.totalCost)}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Outstanding Customer Debts */}
        <div
          onClick={() => onMetricClick?.("outstandingDebts")}
          className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
              Customer Debts
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {formatCurrency(metrics.outstandingDebts.amount)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded">
                {formatCurrency(metrics.outstandingDebts.overdueAmount)} Overdue
              </span>
            </div>
          </div>
        </div>

        {/* 6. Supplier Payables */}
        <div
          onClick={() => onMetricClick?.("supplierPayables")}
          className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
              Supplier Payables
            </span>
            <div className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(metrics.supplierPayables.amount)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] text-slate-400 truncate">
                {formatCurrency(metrics.supplierPayables.dueIn7Days)} due in 7d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Operational Stock & Order Processing Health (7 Cards Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {/* 7. Low Stock Alerts */}
        <div
          onClick={() => onMetricClick?.("lowStockAlerts")}
          className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 hover:border-amber-500/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Low Stock Alerts
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {metrics.lowStockAlerts.count}
            </span>
            <span className="text-[10px] font-bold text-rose-500">
              {metrics.lowStockAlerts.criticalCount} Critical
            </span>
          </div>
        </div>

        {/* 8. Out of Stock Items */}
        <div
          onClick={() => onMetricClick?.("outOfStockItems")}
          className="bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 hover:border-rose-500/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
              Out of Stock
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {metrics.outOfStockItems.count}
            </span>
            <span className="text-[10px] text-slate-400">
              ~{formatCurrency(metrics.outOfStockItems.lostRevenueEst)} risk
            </span>
          </div>
        </div>

        {/* 9. Pending Purchase Orders */}
        <div
          onClick={() => onMetricClick?.("pendingPOs")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 hover:border-indigo-500/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending POs
            </span>
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.pendingPOs.count}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              {metrics.pendingPOs.expectedToday} Today
            </span>
          </div>
        </div>

        {/* 10. Orders Awaiting Dispatch */}
        <div
          onClick={() => onMetricClick?.("awaitingDispatch")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 hover:border-indigo-500/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Awaiting Dispatch
            </span>
            <Truck className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.awaitingDispatch.count}
            </span>
            <span className="text-[10px] font-bold text-amber-500">
              {metrics.awaitingDispatch.urgentCount} Urgent
            </span>
          </div>
        </div>

        {/* 11. Warranty Claims */}
        <div
          onClick={() => onMetricClick?.("warrantyClaims")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 hover:border-indigo-500/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Warranty Claims
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.warrantyClaims.count}
            </span>
            <span className="text-[10px] text-slate-400">
              {metrics.warrantyClaims.approvedRate}% pass
            </span>
          </div>
        </div>

        {/* 12. Recent Sales */}
        <div
          onClick={() => onMetricClick?.("recentSales")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 hover:border-indigo-500/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sales Today
            </span>
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.recentSales.countToday}
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {formatCurrency(metrics.recentSales.avgOrderValue)} avg
            </span>
          </div>
        </div>

        {/* 13. Recent Purchases */}
        <div
          onClick={() => onMetricClick?.("recentPurchases")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 hover:border-indigo-500/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              POs This Week
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.recentPurchases.countThisWeek}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {formatCurrency(metrics.recentPurchases.totalSpend)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
