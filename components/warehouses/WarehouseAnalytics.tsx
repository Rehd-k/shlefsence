"use client";

import React, { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Boxes,
  Zap,
  Building2,
} from "lucide-react";

interface WarehouseAnalyticsProps {
  warehouses: Array<{
    id?: string;
    name?: string;
    type?: string;
    capacity?: string;
  }>;
  bins: Array<{
    currentCount?: number;
    status?: string;
    pickVelocity?: string;
    zone?: string;
    zoneName?: string;
  }>;
}

const ZONE_COLORS = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-sky-500", "bg-rose-500"];

export const WarehouseAnalytics: React.FC<WarehouseAnalyticsProps> = ({ warehouses, bins }) => {
  const totalBinsCount = bins.length;
  const occupiedBinsCount = bins.filter((b) => (b.currentCount || 0) > 0).length;
  const fullBinsCount = bins.filter((b) => b.status === "Full").length;
  const utilizationPct = totalBinsCount > 0 ? Math.round((occupiedBinsCount / totalBinsCount) * 100) : 0;

  const hotBins = bins.filter((b) => b.pickVelocity === "HOT").length;
  const warmBins = bins.filter((b) => b.pickVelocity === "WARM").length;
  const coldBins = bins.filter((b) => b.pickVelocity === "COLD").length;

  const zoneDistribution = useMemo(() => {
    if (bins.length === 0) return [];
    const counts: Record<string, number> = {};
    for (const bin of bins) {
      const zone = bin.zoneName || bin.zone || "Unassigned";
      counts[zone] = (counts[zone] || 0) + 1;
    }
    const total = bins.length;
    return Object.entries(counts)
      .map(([zone, count], idx) => ({
        zone,
        count: `${count} Bins`,
        pct: Math.round((count / total) * 100),
        color: ZONE_COLORS[idx % ZONE_COLORS.length],
      }))
      .sort((a, b) => b.pct - a.pct);
  }, [bins]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overall Utilization</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalBinsCount > 0 ? `${utilizationPct}%` : "—"}
            </span>
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
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Facilities</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{warehouses.length}</span>
            <span className="text-xs text-slate-400 font-bold">Active warehouses</span>
          </div>
          <p className="text-xs text-slate-500">Derived from live warehouse records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Multi-Facility Storage Capacity
          </h3>

          <div className="space-y-3">
            {warehouses.length === 0 && (
              <p className="text-xs text-slate-400">No warehouse facilities loaded.</p>
            )}
            {warehouses.map((wh) => {
              const numPct = parseInt(String(wh.capacity || "0"), 10) || 0;
              return (
                <div key={wh.id || wh.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {wh.name} {wh.type ? `(${wh.type})` : ""}
                    </span>
                    <strong className="text-indigo-600 dark:text-indigo-400">{wh.capacity || "—"}</strong>
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

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Zone Architecture Distribution
          </h3>

          <div className="space-y-3">
            {zoneDistribution.length === 0 && (
              <p className="text-xs text-slate-400">No bin zone data available.</p>
            )}
            {zoneDistribution.map((item) => (
              <div key={item.zone} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.zone}</span>
                  <span className="text-slate-400 font-mono">
                    {item.count} ({item.pct}%)
                  </span>
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
