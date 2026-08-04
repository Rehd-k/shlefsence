"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Boxes,
  Zap,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";

interface WarehouseAnalyticsProps {
  warehouses: any[];
  bins: any[];
}

export const WarehouseAnalytics: React.FC<WarehouseAnalyticsProps> = ({ warehouses, bins }) => {
  const totalBinsCount = bins.length || 96;
  const occupiedBinsCount = bins.filter((b) => b.currentCount > 0).length || 62;
  const fullBinsCount = bins.filter((b) => b.status === "Full").length || 18;
  const utilizationPct = Math.round((occupiedBinsCount / totalBinsCount) * 100);

  const hotBins = bins.filter((b) => b.pickVelocity === "HOT").length || 24;
  const warmBins = bins.filter((b) => b.pickVelocity === "WARM").length || 42;
  const coldBins = bins.filter((b) => b.pickVelocity === "COLD").length || 30;

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overall Utilization</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{utilizationPct}%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">+4.2% vs last month</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${utilizationPct}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Storage Bins</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{occupiedBinsCount}</span>
            <span className="text-xs text-slate-400">/ {totalBinsCount} Bins Occupied</span>
          </div>
          <p className="text-xs text-slate-500">{fullBinsCount} Bins at max capacity</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pick Velocity Heat</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{hotBins} Bins</span>
            <Badge variant="rose" size="sm">HOT Fast Movers</Badge>
          </div>
          <p className="text-xs text-slate-500">{warmBins} Warm | {coldBins} Cold Storage</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Operational Throughput</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">98.4%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">On-time pick rate</span>
          </div>
          <p className="text-xs text-slate-500">Avg pick cycle time: 4.2 mins</p>
        </div>
      </div>

      {/* Breakdown Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facility Capacity Comparison */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Multi-Facility Storage Capacity
          </h3>

          <div className="space-y-3">
            {warehouses.map((wh) => {
              const numPct = parseInt(wh.capacity) || 60;
              return (
                <div key={wh.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{wh.name} ({wh.type})</span>
                    <strong className="text-indigo-600 dark:text-indigo-400">{wh.capacity}</strong>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        numPct >= 80 ? "bg-rose-500" : numPct >= 60 ? "bg-indigo-600" : "bg-emerald-500"
                      }`}
                      style={{ width: `${numPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Zone Architecture Distribution
          </h3>

          <div className="space-y-3">
            {[
              { zone: "Zone A - OLED Displays", count: "32 Bins", pct: 33, color: "bg-indigo-500" },
              { zone: "Zone B - High Capacity Batteries", count: "24 Bins", pct: 25, color: "bg-emerald-500" },
              { zone: "Zone C - Flex Cables & ICs", count: "24 Bins", pct: 25, color: "bg-amber-500" },
              { zone: "Zone R & P - Receiving/Dispatch", count: "16 Bins", pct: 17, color: "bg-sky-500" },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.zone}</span>
                  <span className="text-slate-400 font-mono">{item.count} ({item.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
