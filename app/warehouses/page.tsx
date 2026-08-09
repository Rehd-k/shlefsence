"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { InteractiveWarehouseMap } from "@/components/warehouses/InteractiveWarehouseMap";
import { BarcodeScannerModal } from "@/components/warehouses/BarcodeScannerModal";
import { ReceivingTab } from "@/components/warehouses/ReceivingTab";
import { PickingTab } from "@/components/warehouses/PickingTab";
import { PackingTab } from "@/components/warehouses/PackingTab";
import { CycleCountTab } from "@/components/warehouses/CycleCountTab";
import { TransfersTab } from "@/components/warehouses/TransfersTab";
import { WarehouseAnalytics } from "@/components/warehouses/WarehouseAnalytics";
import { StockAdjustmentModal } from "@/components/warehouses/StockAdjustmentModal";
import { AddLocationModal } from "@/components/warehouses/AddLocationModal";
import {
  Building2,
  Plus,
  Layers,
  MapPin,
  Boxes,
  RefreshCcw,
  Barcode,
  Truck,
  ShoppingBag,
  Package,
  ClipboardList,
  ArrowRightLeft,
  PieChart,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
} from "lucide-react";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [hierarchyData, setHierarchyData] = useState<{
    warehouse: any;
    zones: any[];
    racks: any[];
    shelves: any[];
    bins: any[];
  } | null>(null);

  // Operations state
  const [receivings, setReceivings] = useState<any[]>([]);
  const [pickings, setPickings] = useState<any[]>([]);
  const [packings, setPackings] = useState<any[]>([]);
  const [cycleCounts, setCycleCounts] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<
    "map" | "receiving" | "picking" | "packing" | "cycleCount" | "transfers" | "analytics"
  >("map");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [targetAdjustmentBin, setTargetAdjustmentBin] = useState<any>(null);

  // Fetch warehouses list
  const fetchWarehouses = async () => {
    try {
      const res = await fetch("/api/warehouses");
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setWarehouses(json.data);
        if (!selectedWarehouseId) {
          setSelectedWarehouseId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading warehouses:", err);
    }
  };

  // Fetch 5-level hierarchy data for selected warehouse
  const fetchHierarchy = async (whId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/warehouses/hierarchy?warehouseId=${whId}`);
      const json = await res.json();
      if (json.success) {
        setHierarchyData(json.data);
      }
    } catch (err) {
      console.error("Error loading hierarchy:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch operations data
  const fetchOperations = async (whId: string) => {
    try {
      const [recRes, pickRes, packRes, ccRes, trfRes] = await Promise.all([
        fetch(`/api/warehouses/operations/receiving?warehouseId=${whId}`),
        fetch(`/api/warehouses/operations/picking?warehouseId=${whId}`),
        fetch(`/api/warehouses/operations/packing?warehouseId=${whId}`),
        fetch(`/api/warehouses/operations/cycle-count?warehouseId=${whId}`),
        fetch(`/api/warehouses/operations/transfers`),
      ]);

      const [recJson, pickJson, packJson, ccJson, trfJson] = await Promise.all([
        recRes.json(),
        pickRes.json(),
        packRes.json(),
        ccRes.json(),
        trfRes.json(),
      ]);

      if (recJson.success) setReceivings(recJson.data);
      if (pickJson.success) setPickings(pickJson.data);
      if (packJson.success) setPackings(packJson.data);
      if (ccJson.success) setCycleCounts(ccJson.data);
      if (trfJson.success) setTransfers(trfJson.data);
    } catch (err) {
      console.error("Error loading warehouse operations:", err);
    }
  };

  const refreshAll = () => {
    if (selectedWarehouseId) {
      fetchHierarchy(selectedWarehouseId);
      fetchOperations(selectedWarehouseId);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouseId) {
      fetchHierarchy(selectedWarehouseId);
      fetchOperations(selectedWarehouseId);
    }
  }, [selectedWarehouseId]);

  const activeWarehouse = warehouses.find((w) => w.id === selectedWarehouseId) || hierarchyData?.warehouse;

  const handleScanResult = (code: string, type: "SKU" | "BIN" | "TRANSFER") => {
    // barcode scan handled by modal callbacks
  };

  const handleQuickAdjust = (bin: any) => {
    setTargetAdjustmentBin(bin);
    setIsAdjustmentModalOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Warehouse & Branch Management
              </h1>
              <Badge variant="indigo" size="sm">
                5-Level Hierarchy
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Multi-facility locations, Zone-Rack-Shelf-Bin architectures, interactive floor maps, receiving, picking, packing, cycle counts, and inter-branch transfer routes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
            {/* Facility Selector */}
            {warehouses.length > 0 && (
              <div className="w-56">
                <Select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  options={warehouses.map((w) => ({
                    label: `${w.name} (${w.type || "Hub"})`,
                    value: w.id,
                  }))}
                />
              </div>
            )}

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddLocationOpen(true)}
            >
              Add Shop / Warehouse
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<Barcode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              onClick={() => setIsScannerOpen(true)}
            >
              Barcode Scanner
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
              onClick={refreshAll}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Selected Facility Overview Card */}
        {activeWarehouse && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-200/60 dark:border-indigo-800/60">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {activeWarehouse.name}
                    </h2>
                    <Badge variant="indigo" size="sm">
                      {activeWarehouse.type || "Main Hub"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {activeWarehouse.address}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <div className="text-right">
                  <span className="text-slate-400 block">Total SKUs Stored</span>
                  <strong className="text-slate-900 dark:text-white text-sm font-extrabold">
                    {activeWarehouse.skusCount || 1420}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Storage Capacity</span>
                  <Badge variant="neutral" size="sm">
                    {activeWarehouse.capacity || "84% Full"}
                  </Badge>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Facility Manager</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {activeWarehouse.manager}
                  </span>
                </div>
              </div>
            </div>

            {/* Hierarchy Level Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Hierarchy Depth:</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold">1. Facility</span>
                <span>&rarr;</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold">2. Zone</span>
                <span>&rarr;</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold">3. Rack</span>
                <span>&rarr;</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold">4. Shelf</span>
                <span>&rarr;</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold text-indigo-600 dark:text-indigo-400">5. Bin</span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span>Zones: <strong>{hierarchyData?.zones.length || 4}</strong></span>
                <span>Racks: <strong>{hierarchyData?.racks.length || 8}</strong></span>
                <span>Shelves: <strong>{hierarchyData?.shelves.length || 24}</strong></span>
                <span>Bins: <strong>{hierarchyData?.bins.length || 96}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
          {[
            { id: "map", label: "Interactive Map & Heatmap", icon: <Layers className="w-4 h-4" /> },
            { id: "receiving", label: `Receiving (${receivings.length})`, icon: <Truck className="w-4 h-4" /> },
            { id: "picking", label: `Picking (${pickings.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
            { id: "packing", label: `Packing (${packings.length})`, icon: <Package className="w-4 h-4" /> },
            { id: "cycleCount", label: `Cycle Count Audits (${cycleCounts.length})`, icon: <ClipboardList className="w-4 h-4" /> },
            { id: "transfers", label: `Branch Transfers (${transfers.length})`, icon: <ArrowRightLeft className="w-4 h-4" /> },
            { id: "analytics", label: "Utilization & Analytics", icon: <PieChart className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === "map" && hierarchyData && (
          <InteractiveWarehouseMap
            zones={hierarchyData.zones}
            bins={hierarchyData.bins}
            onQuickAdjust={handleQuickAdjust}
          />
        )}

        {activeTab === "receiving" && (
          <ReceivingTab
            orders={receivings}
            availableBins={hierarchyData?.bins || []}
            onRefresh={refreshAll}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {activeTab === "picking" && (
          <PickingTab
            tickets={pickings}
            onRefresh={refreshAll}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {activeTab === "packing" && <PackingTab orders={packings} onRefresh={refreshAll} />}

        {activeTab === "cycleCount" && <CycleCountTab counts={cycleCounts} onRefresh={refreshAll} />}

        {activeTab === "transfers" && (
          <TransfersTab transfers={transfers} warehouses={warehouses} onRefresh={refreshAll} />
        )}

        {activeTab === "analytics" && (
          <WarehouseAnalytics warehouses={warehouses} bins={hierarchyData?.bins || []} />
        )}
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanResult={handleScanResult}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        targetBin={targetAdjustmentBin}
        onSuccess={refreshAll}
      />

      {/* Add Location (Warehouse or Shop) Modal */}
      <AddLocationModal
        isOpen={isAddLocationOpen}
        onClose={() => setIsAddLocationOpen(false)}
        onLocationAdded={(loc) => {
          fetchWarehouses();
        }}
      />
    </AppLayout>
  );
}
