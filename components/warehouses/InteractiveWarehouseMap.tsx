"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import {
  Layers,
  Flame,
  PieChart,
  Box,
  SlidersHorizontal,
  Plus,
  ArrowRightLeft,
  Barcode,
  Search,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

interface Zone {
  id: string;
  code: string;
  name: string;
  type: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BinItem {
  sku: string;
  name: string;
  quantity: number;
}

interface BinNode {
  id: string;
  binCode: string;
  zoneId: string;
  maxCapacity: number;
  currentCount: number;
  pickVelocity: "HOT" | "WARM" | "COLD";
  status: "Available" | "Full" | "Quarantine" | "Maintenance";
  items: BinItem[];
}

interface InteractiveWarehouseMapProps {
  zones: Zone[];
  bins: BinNode[];
  onBinSelect?: (bin: BinNode) => void;
  onQuickAdjust?: (bin: BinNode) => void;
}

export const InteractiveWarehouseMap: React.FC<InteractiveWarehouseMapProps> = ({
  zones,
  bins,
  onQuickAdjust,
}) => {
  const [mapMode, setMapMode] = useState<"layout" | "heatmap" | "utilization">("layout");
  const [selectedZone, setSelectedZone] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBin, setSelectedBin] = useState<BinNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredBins = bins.filter((b) => {
    const matchesZone = selectedZone === "ALL" || b.zoneId === selectedZone;
    const matchesSearch =
      !searchQuery ||
      b.binCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.items.some(
        (i) =>
          i.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesZone && matchesSearch;
  });

  const getHeatColor = (velocity: "HOT" | "WARM" | "COLD") => {
    if (velocity === "HOT") return "bg-rose-500 text-white border-rose-600 shadow-rose-200 dark:shadow-none animate-pulse";
    if (velocity === "WARM") return "bg-amber-400 text-amber-950 border-amber-500 shadow-amber-100 dark:shadow-none";
    return "bg-cyan-500 text-white border-cyan-600 shadow-cyan-100 dark:shadow-none";
  };

  const getUtilizationColor = (current: number, max: number) => {
    const pct = (current / max) * 100;
    if (pct >= 90) return "bg-rose-600 text-white border-rose-700 font-bold";
    if (pct >= 60) return "bg-emerald-500 text-white border-emerald-600 font-bold";
    if (pct >= 20) return "bg-sky-500 text-white border-sky-600 font-medium";
    return "bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400";
  };

  const getStatusColor = (status: BinNode["status"]) => {
    switch (status) {
      case "Full":
        return "bg-purple-600 text-white border-purple-700";
      case "Quarantine":
        return "bg-amber-500 text-white border-amber-600";
      case "Maintenance":
        return "bg-rose-600 text-white border-rose-700";
      default:
        return "bg-indigo-600 text-white border-indigo-700";
    }
  };

  const handleBinClick = (bin: BinNode) => {
    setSelectedBin(bin);
    setIsDrawerOpen(true);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Top Map Controls Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Box className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Interactive Warehouse Floor Map
            </h2>
            <Badge variant="indigo" size="sm">
              Live Interactive Grid
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any bin block to inspect contents, check SKU heat levels, or execute quick bin stock adjustments.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setMapMode("layout")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapMode === "layout"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Layout View
          </button>

          <button
            onClick={() => setMapMode("heatmap")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapMode === "heatmap"
                ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Inventory Heatmap
          </button>

          <button
            onClick={() => setMapMode("utilization")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapMode === "utilization"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <PieChart className="w-3.5 h-3.5" /> Space Utilization
          </button>
        </div>
      </div>

      {/* Search & Zone Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Bin Code or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Zone:
          </span>
          <button
            onClick={() => setSelectedZone("ALL")}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              selectedZone === "ALL"
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            All Zones
          </button>
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => setSelectedZone(z.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedZone === z.id
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {z.code}
            </button>
          ))}
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Legend Mode ({mapMode.toUpperCase()}):</span>
          {mapMode === "layout" && (
            <>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Full</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Quarantine</span>
            </>
          )}
          {mapMode === "heatmap" && (
            <>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span> HOT (Fast Pick)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> WARM (Normal)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> COLD (Slow Move)</span>
            </>
          )}
          {mapMode === "utilization" && (
            <>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> &ge;90% Capacity</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 60-89% Capacity</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> 20-59% Capacity</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Empty / Low</span>
            </>
          )}
        </div>
        <div className="text-slate-400 text-xs">
          Showing <strong>{filteredBins.length}</strong> Bins
        </div>
      </div>

      {/* Interactive 2D Grid Floor Map */}
      <div className="relative min-h-[380px] bg-slate-900 rounded-xl p-4 overflow-x-auto border border-slate-800 shadow-inner">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredBins.map((b) => {
            const pct = Math.round((b.currentCount / b.maxCapacity) * 100);

            let nodeColor = getStatusColor(b.status);
            if (mapMode === "heatmap") nodeColor = getHeatColor(b.pickVelocity);
            else if (mapMode === "utilization") nodeColor = getUtilizationColor(b.currentCount, b.maxCapacity);

            return (
              <button
                key={b.id}
                onClick={() => handleBinClick(b)}
                className={`group relative flex flex-col justify-between p-3 rounded-xl border text-left transition-all duration-200 hover:scale-[1.03] hover:shadow-lg focus:outline-none ${nodeColor}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-mono font-bold tracking-tight opacity-90">{b.binCode}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/20 backdrop-blur-xs">
                    {pct}%
                  </span>
                </div>

                <div className="my-2">
                  <div className="text-xs font-bold truncate">
                    {b.items.length > 0 ? b.items[0].sku : "Empty Bin"}
                  </div>
                  <div className="text-[10px] opacity-80 truncate">
                    {b.items.length > 0 ? b.items[0].name : "No assigned stock"}
                  </div>
                </div>

                <div className="w-full flex items-center justify-between text-[10px] opacity-90 border-t border-white/20 pt-1.5 mt-1">
                  <span>Count: {b.currentCount}/{b.maxCapacity}</span>
                  <span className="font-semibold">{b.pickVelocity}</span>
                </div>
              </button>
            );
          })}
        </div>

        {filteredBins.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Info className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">No storage bins found matching your filter criteria.</p>
          </div>
        )}
      </div>

      {/* Bin Detail Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Bin Details: ${selectedBin?.binCode || ""}`}
        subtitle="Bin content inventory, stock velocity rating, and operational actions."
        size="md"
      >
        {selectedBin && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs text-slate-400 block">Occupancy Rate</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {Math.round((selectedBin.currentCount / selectedBin.maxCapacity) * 100)}%
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${(selectedBin.currentCount / selectedBin.maxCapacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs text-slate-400 block">Pick Velocity</span>
                <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                  {selectedBin.pickVelocity}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">High movement frequency rating</p>
              </div>
            </div>

            {/* Items Stored in Bin */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Stored Items Breakdown ({selectedBin.items.length})
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {selectedBin.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {item.sku}
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.name}</p>
                    </div>
                    <Badge variant="indigo" size="sm">
                      {item.quantity} Units
                    </Badge>
                  </div>
                ))}

                {selectedBin.items.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">No items currently stored in this bin.</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="primary"
                size="sm"
                fullWidth
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setIsDrawerOpen(false);
                  if (onQuickAdjust) onQuickAdjust(selectedBin);
                }}
              >
                Adjust Bin Stock
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
