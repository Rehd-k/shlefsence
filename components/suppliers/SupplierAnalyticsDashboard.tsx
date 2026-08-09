"use client";

import React from "react";
import { ISupplier } from "@/lib/types/supplier";
import { Badge } from "@/components/ui/Badge";
import { Award, Clock, ShieldCheck, DollarSign, BarChart2, CheckCircle2, AlertOctagon } from "lucide-react";

interface SupplierAnalyticsDashboardProps {
  suppliers: ISupplier[];
  onSelectSupplier: (supplier: ISupplier) => void;
}

export const SupplierAnalyticsDashboard: React.FC<SupplierAnalyticsDashboardProps> = ({
  suppliers,
  onSelectSupplier,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  const totalSpend = suppliers.reduce((acc, s) => acc + (s.totalPurchasesValue || 0), 0) || 1;
  const activeVendors = suppliers.filter(
    (s) => (s as { status?: string }).status === "Active" || !(s as { status?: string }).status
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Section: Executive Spend & SLA Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend Distribution Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Procurement Spend Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Proportional total purchase volume across active manufacturers & vendors
              </p>
            </div>
            <Badge variant="purple" size="sm">
              {activeVendors} Active Vendor{activeVendors === 1 ? "" : "s"}
            </Badge>
          </div>

          <div className="space-y-3 pt-2">
            {suppliers.map((sup) => {
              const spend = sup.totalPurchasesValue || 0;
              const pct = Math.round((spend / totalSpend) * 100);
              return (
                <div
                  key={sup.id || sup.name}
                  onClick={() => onSelectSupplier(sup)}
                  className="group cursor-pointer p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-bold">
                      {sup.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{pct}% of total</span>
                      <span className="text-slate-900 dark:text-white font-extrabold">
                        {formatCurrency(spend)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Supplier Tier Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Vendor Tiers & Health
              </h3>
            </div>

            <div className="space-y-4 pt-4">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      Preferred Tier
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Gold SLA & Low Defect Guaranteed
                    </p>
                  </div>
                </div>
                <span className="text-lg font-black text-emerald-800 dark:text-emerald-200">
                  {suppliers.filter((s) => s.status === "Preferred").length}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                      Active Tier
                    </h4>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                      Standard Net 30/60 Vendors
                    </p>
                  </div>
                </div>
                <span className="text-lg font-black text-indigo-800 dark:text-indigo-200">
                  {suppliers.filter((s) => s.status === "Active").length}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      Under Review
                    </h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      Lead Time / Quality Audit Active
                    </p>
                  </div>
                </div>
                <span className="text-lg font-black text-amber-800 dark:text-amber-200">
                  {suppliers.filter((s) => s.status === "Under Review").length}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Overall Supplier Quality Avg</span>
            <strong className="text-slate-900 dark:text-white font-bold text-sm">98.5%</strong>
          </div>
        </div>
      </div>

      {/* Performance Scorecards Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Vendor Quality & Delivery SLA Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical performance ratings, lead time metrics, and defect rates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {suppliers.map((sup) => {
            const score = sup.performance?.overallScore || 98.0;
            const deliveryDays = sup.performance?.avgDeliveryDays || parseFloat(sup.leadTime) || 4;
            const defectRate = sup.performance?.defectiveRate || 0.5;
            const onTime = sup.performance?.onTimeDeliveryRate || 97.0;

            return (
              <div
                key={sup.id || sup.name}
                onClick={() => onSelectSupplier(sup)}
                className="bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 cursor-pointer hover:border-indigo-500/50 hover:shadow-md transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {sup.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">{sup.industry}</p>
                  </div>
                  <Badge
                    variant={
                      score >= 99 ? "success" : score >= 97 ? "purple" : "warning"
                    }
                    size="sm"
                  >
                    {score}% Overall
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200/60 dark:border-slate-700/60 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      On-Time
                    </span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {onTime}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Avg Lead
                    </span>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {deliveryDays}d
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Defects
                    </span>
                    <p className="font-bold text-rose-500 mt-0.5">{defectRate}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span>Payables: <strong className="text-slate-900 dark:text-white">{formatCurrency(sup.outstandingBalance)}</strong></span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">View Profile &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
