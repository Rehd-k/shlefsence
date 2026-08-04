"use client";

import React from "react";
import { DollarSign, Clock, AlertTriangle, Truck, ShieldCheck, ArrowUpRight, TrendingDown } from "lucide-react";
import { ISupplierKPIs } from "@/lib/types/supplier";

interface SupplierKPIHeaderProps {
  kpis: ISupplierKPIs;
  loading?: boolean;
}

export const SupplierKPIHeader: React.FC<SupplierKPIHeaderProps> = ({ kpis, loading }) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Purchases */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-indigo-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Purchases
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {loading ? "..." : formatCurrency(kpis.totalPurchases)}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% YoY Procurement Spend</span>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full w-[82%]" />
        </div>
      </div>

      {/* 2. Outstanding Balance */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Outstanding Balance
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {loading ? "..." : formatCurrency(kpis.outstandingBalance)}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
            <span>Net 30/60 Unpaid Payables</span>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full w-[38%]" />
        </div>
      </div>

      {/* 3. Average Delivery Time */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Avg Delivery Time
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1">
            {loading ? "..." : kpis.averageDeliveryTime}
            <span className="text-sm font-semibold text-slate-400">Days</span>
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-0.6 Days SLA Improvement</span>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full w-[94%]" />
        </div>
      </div>

      {/* 4. Defective Rate */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-rose-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Defective Rate
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1">
            {loading ? "..." : `${kpis.defectiveRate}%`}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>99.25% OEM Pass Rate</span>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full w-[18%]" />
        </div>
      </div>
    </div>
  );
};
