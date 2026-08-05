"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocation } from "@/lib/context/LocationContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, Plus, Search, Truck, RefreshCcw } from "lucide-react";
import { CreatePOModal } from "@/components/dashboard/modals/CreatePOModal";

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);

  // Dynamic context and date filtering
  const { activeLocation } = useLocation();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (activeLocation && activeLocation !== "All Locations" && activeLocation !== "All Warehouses") {
        queryParams.set("warehouse", activeLocation);
      }
      if (startDate) queryParams.set("startDate", startDate);
      if (endDate) queryParams.set("endDate", endDate);

      const res = await fetch(`/api/purchase-orders?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) setPos(json.data);
    } catch (err) {
      console.error("Error loading purchase orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, [activeLocation, startDate, endDate]);

  const handlePOCreated = async (newPO: any) => {
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPO),
      });
      const json = await res.json();
      if (json.success) {
        setPos((prev) => [json.data, ...prev]);
      }
    } catch (err) {
      setPos((prev) => [newPO, ...prev]);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Purchase Orders (POs)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track incoming supplier shipments, factory orders, and putaway receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
            onClick={fetchPOs}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsPOModalOpen(true)}
          >
            Create Purchase Order
          </Button>
        </div>
      </div>

      {/* Date Range & Location Context Panel */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs mb-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500">From Date:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500">To Date:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
          />
        </div>
        {(startDate || endDate) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
          >
            Clear Range
          </Button>
        )}
        <span className="text-[11px] text-slate-400 font-medium ml-auto">
          Active Location: <b className="text-indigo-600 dark:text-indigo-400">{activeLocation}</b>
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">PO Ref</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Destination Hub</th>
              <th className="px-4 py-3">Total Units</th>
              <th className="px-4 py-3 text-right">Value ($)</th>
              <th className="px-4 py-3">Expected Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {pos.map((po) => (
              <tr key={po.id || po._id || po.poNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {po.poNumber}
                </td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{po.supplier}</td>
                <td className="px-4 py-3 text-slate-400">{po.warehouse}</td>
                <td className="px-4 py-3 font-mono">{po.totalUnits} pcs</td>
                <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-white font-mono">
                  ${(po.totalValue || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-slate-400">{po.expectedDate}</td>
                <td className="px-4 py-3">
                  <Badge variant={po.status?.includes("Received") ? "success" : "warning"} size="sm">
                    {po.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreatePOModal
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        onPOCreated={handlePOCreated}
      />
    </AppLayout>
  );
}
