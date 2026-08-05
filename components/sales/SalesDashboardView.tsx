"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Building2,
  UserCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { SalesDashboardMetrics } from "@/lib/types/sales";
import { SalesChartsSection } from "./SalesChartsSection";
import { formatCurrency } from "@/lib/utils/formatCurrency";

interface SalesDashboardViewProps {
  metrics: SalesDashboardMetrics;
  onNavigateTab: (tab: any) => void;
  dailySales: any[];
  revenueVsCost: any[];
  profitMargins: any[];
  topCustomers: any[];
}

export const SalesDashboardView: React.FC<SalesDashboardViewProps> = ({
  metrics,
  onNavigateTab,
  dailySales,
  revenueVsCost,
  profitMargins,
  topCustomers,
}) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Revenue Card */}
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {formatCurrency(metrics.totalRevenue)}
            </h2>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +{metrics.totalRevenueTrend}%
              </span>
              <span className="text-slate-400 text-[11px]">vs last month</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        </Card>

        {/* 2. Gross Profit Card */}
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gross Profit (COGS Deducted)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {formatCurrency(metrics.grossProfit)}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <Badge variant="success" size="sm">
                {metrics.grossProfitMargin}% Margin
              </Badge>
              <span className="text-slate-400 text-[11px]">Strong B2B Markup</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </Card>

        {/* 3. Total Orders & AOV Card */}
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Sales Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {metrics.totalOrders} <span className="text-sm font-normal text-slate-400">orders</span>
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-bold font-mono">
                {formatCurrency(metrics.avgOrderValue)} AOV
              </span>
              <span className="text-slate-400 text-[11px]">• +{metrics.totalOrdersTrend}% vol</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
        </Card>

        {/* 4. Outstanding AR & Overdue Card */}
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden cursor-pointer hover:border-amber-400 transition" onClick={() => onNavigateTab("outstanding")}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Outstanding Invoices (AR)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h2 className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
              {formatCurrency(metrics.outstandingInvoicesTotal)}
            </h2>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="text-rose-600 dark:text-rose-400 font-extrabold font-mono">
                {formatCurrency(metrics.overdueAmount)} Overdue
              </span>
              <span className="text-slate-400 text-[11px]">• 4 Accounts</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </Card>
      </div>

      {/* Multichannel Revenue Breakdown Banner */}
      <Card className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Sales Channel Velocity</span>
              <Badge variant="purple" size="sm">3 Active Channels</Badge>
            </div>
            <p className="text-xs text-slate-300">
              Wholesale accounts represent <strong className="text-white">70.0%</strong> of monthly order volume.
            </p>
          </div>

          <div className="flex items-center gap-6 divide-x divide-slate-800 text-xs">
             <div className="pl-4 first:pl-0">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Wholesale B2B
              </div>
              <span className="text-base font-extrabold text-white font-mono">
                {formatCurrency(metrics.wholesaleRevenue)}
              </span>
            </div>

            <div className="pl-4">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Retail Repair
              </div>
              <span className="text-base font-extrabold text-white font-mono">
                {formatCurrency(metrics.retailRevenue)}
              </span>
            </div>

            <div className="pl-4">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Counter POS
              </div>
              <span className="text-base font-extrabold text-white font-mono">
                {formatCurrency(metrics.posRevenue)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Embedded Charts Section */}
      <SalesChartsSection
        dailySales={dailySales}
        revenueVsCost={revenueVsCost}
        profitMargins={profitMargins}
        topCustomers={topCustomers}
      />
    </div>
  );
};
