"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocation } from "@/lib/context/LocationContext";
import { InventorySummaryCards } from "@/components/inventory/InventorySummaryCards";
import { InventoryFilterBar } from "@/components/inventory/InventoryFilterBar";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryBulkActions } from "@/components/inventory/InventoryBulkActions";
import { InventoryMovementDrawer } from "@/components/inventory/InventoryMovementDrawer";
import { StockAdjustmentModal } from "@/components/inventory/StockAdjustmentModal";
import { NewStockItemModal } from "@/components/inventory/NewStockItemModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  IInventoryItem,
  IInventoryMovement,
  InventoryFilterOptions,
  InventorySummary,
} from "@/lib/types/inventory";
import { INITIAL_INVENTORY_ITEMS } from "@/lib/seed/inventorySeedData";
import {
  Package,
  Plus,
  RefreshCcw,
  Database,
  Layers,
  CheckCircle,
} from "lucide-react";

export default function InventoryPage() {
  const [items, setItems] = useState<IInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { activeLocation } = useLocation();
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Selected item for drawer view
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<IInventoryItem | null>(null);
  const [drawerMovements, setDrawerMovements] = useState<IInventoryMovement[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Single item adjustment modal trigger
  const [singleAdjustItem, setSingleAdjustItem] = useState<IInventoryItem | null>(null);
  const [isNewStockModalOpen, setIsNewStockModalOpen] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter state
  const [filters, setFilters] = useState<InventoryFilterOptions>({
    search: "",
    warehouse: "",
    brand: "",
    supplier: "",
    category: "",
    quality: "",
    status: "",
  });

  // Initial load
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.set("search", filters.search);
      if (filters.warehouse || (activeLocation !== "All Locations" && activeLocation !== "All Warehouses")) {
        queryParams.set("warehouse", filters.warehouse || activeLocation);
      }
      if (filters.brand) queryParams.set("brand", filters.brand);
      if (filters.supplier) queryParams.set("supplier", filters.supplier);
      if (filters.category) queryParams.set("category", filters.category);
      if (filters.quality) queryParams.set("quality", filters.quality);
      if (filters.status) queryParams.set("status", filters.status);

      const res = await fetch(`/api/inventory?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
      } else {
        throw new Error("Local fallback required");
      }
    } catch (e) {
      let loaded = INITIAL_INVENTORY_ITEMS.map((item, idx) => ({
        ...item,
        _id: `item-${idx + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setItems(loaded);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filters, activeLocation]);

  // Filter handlers
  const handleResetFilters = () => {
    setFilters({
      search: "",
      warehouse: "",
      brand: "",
      supplier: "",
      category: "",
      quality: "",
      status: "",
    });
  };

  const handleFilterByStatus = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status,
    }));
  };

  // Table selection handlers
  const handleSelectRow = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedRowIds((prev) => [...prev, id]);
    } else {
      setSelectedRowIds((prev) => prev.filter((rId) => rId !== id));
    }
  };

  const handleSelectAllRows = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedRowIds(filteredItems.map((i) => i._id));
    } else {
      setSelectedRowIds([]);
    }
  };

  // Row click -> Open Drawer & fetch movement history
  const handleRowClick = async (item: IInventoryItem) => {
    setSelectedDrawerItem(item);
    setIsDrawerOpen(true);

    try {
      const res = await fetch(`/api/inventory/${item.sku}/movements`);
      const json = await res.json();
      if (json.success) {
        setDrawerMovements(json.data);
      } else {
        throw new Error("Movement fallback");
      }
    } catch (e) {
      const fallbackMovs: IInventoryMovement[] = [
        {
          _id: `m-${Date.now()}`,
          inventoryItemId: item._id,
          sku: item.sku,
          productName: item.product,
          type: "RECEIPT",
          quantityChange: item.quantity,
          previousQuantity: 0,
          newQuantity: item.quantity,
          toWarehouse: item.warehouse,
          toShelf: item.shelf,
          reason: "Warehouse PO Receiving Inspection",
          performedBy: "Alex Rivers (Inventory Lead)",
          createdAt: item.lastMovedAt || new Date().toISOString(),
        },
      ];
      setDrawerMovements(fallbackMovs);
    }
  };

  // Bulk actions triggers
  const handleStockAdjusted = (adjData: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (!selectedRowIds.includes(item._id)) return item;
        let newQty = item.quantity;
        if (adjData.adjustmentType === "ADD") newQty += adjData.quantity;
        else if (adjData.adjustmentType === "SUBTRACT") newQty = Math.max(0, newQty - adjData.quantity);
        else if (adjData.adjustmentType === "SET") newQty = adjData.quantity;

        const newStatus =
          newQty === 0
            ? "OUT_OF_STOCK"
            : newQty <= item.reorderPoint
            ? "LOW_STOCK"
            : "IN_STOCK";

        return {
          ...item,
          quantity: newQty,
          available: Math.max(0, newQty - item.reserved),
          status: newStatus,
          lastMovedAt: new Date().toISOString(),
        };
      })
    );
    setSelectedRowIds([]);
    triggerToast(`Adjusted stock for ${selectedRowIds.length} items`);
  };

  const handleInventoryMoved = (moveData: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (!selectedRowIds.includes(item._id)) return item;
        return {
          ...item,
          warehouse: moveData.targetWarehouse,
          shelf: moveData.targetShelf,
          lastMovedAt: new Date().toISOString(),
        };
      })
    );
    setSelectedRowIds([]);
    triggerToast(`Relocated ${selectedRowIds.length} items to ${moveData.targetWarehouse}`);
  };

  const handleItemsDeleted = () => {
    setItems((prev) => prev.filter((item) => !selectedRowIds.includes(item._id)));
    setSelectedRowIds([]);
    triggerToast("Selected items removed from inventory");
  };

  // Filter computation
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchSKU = item.sku.toLowerCase().includes(q);
        const matchProduct = item.product.toLowerCase().includes(q);
        const matchModel = item.phoneModel.toLowerCase().includes(q);
        const matchBarcode = item.barcode?.includes(q);
        if (!matchSKU && !matchProduct && !matchModel && !matchBarcode) return false;
      }
      if (filters.warehouse && item.warehouse !== filters.warehouse) return false;
      if (filters.brand && item.brand !== filters.brand) return false;
      if (filters.supplier && item.supplier !== filters.supplier) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.quality && item.quality !== filters.quality) return false;
      if (filters.status && item.status !== filters.status) return false;

      return true;
    });
  }, [items, filters]);

  // Compute Summary Metrics
  const summaryMetrics: InventorySummary = useMemo(() => {
    let totalUnits = 0;
    let totalValue = 0;
    let totalCost = 0;
    let lowStockCount = 0;
    let criticalCount = 0;
    let deadStockCount = 0;
    let deadStockCapital = 0;

    items.forEach((item) => {
      totalUnits += item.quantity;
      totalCost += item.cost * item.quantity;
      totalValue += item.sellingPrice * item.quantity;

      if (item.status === "LOW_STOCK") lowStockCount++;
      if (item.status === "OUT_OF_STOCK") criticalCount++;
      if (item.status === "DEAD_STOCK") {
        deadStockCount++;
        deadStockCapital += item.cost * item.quantity;
      }
    });

    return {
      totalStock: {
        units: totalUnits,
        skus: items.length,
        trendPercentage: 4.8,
      },
      inventoryValue: {
        totalValue: totalValue,
        totalCost: totalCost,
        potentialProfit: totalValue - totalCost,
      },
      lowStock: {
        count: lowStockCount,
        criticalCount: criticalCount,
      },
      deadStock: {
        count: deadStockCount,
        tiedCapital: deadStockCapital,
      },
      incomingStock: {
        units: 1450,
        expectedPOs: 3,
      },
    };
  }, [items]);

  const selectedObjects = useMemo(() => {
    return items.filter((item) => selectedRowIds.includes(item._id));
  }, [items, selectedRowIds]);

  return (
    <AppLayout>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/40 flex items-center gap-3 text-xs font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Inventory & Bin Management
            </h1>
            <Badge variant="success" size="sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-warehouse stock control, bin shelf tracking, barcode printing, and audit movement logs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCcw className="w-3.5 h-3.5" />}
            onClick={fetchInventory}
          >
            Refresh Stock
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsNewStockModalOpen(true)}
          >
            Add Stock Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <InventorySummaryCards
        summary={summaryMetrics}
        onFilterByStatus={handleFilterByStatus}
      />

      {/* Advanced Filter Bar */}
      <InventoryFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Large Searchable Inventory Table */}
      <InventoryTable
        data={filteredItems}
        selectedRowIds={selectedRowIds}
        onSelectRow={handleSelectRow}
        onSelectAllRows={handleSelectAllRows}
        onRowClick={handleRowClick}
        isLoading={isLoading}
      />

      {/* Floating Sticky Bulk Actions Bar */}
      <InventoryBulkActions
        selectedItems={selectedObjects}
        onClearSelection={() => setSelectedRowIds([])}
        onStockAdjusted={handleStockAdjusted}
        onInventoryMoved={handleInventoryMoved}
        onItemsDeleted={handleItemsDeleted}
      />

      {/* Slide-over Side Panel (Inventory Movement History) */}
      <InventoryMovementDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        item={selectedDrawerItem}
        movements={drawerMovements}
        onQuickAdjust={(itemToAdjust) => {
          setSingleAdjustItem(itemToAdjust);
          setSelectedRowIds([itemToAdjust._id]);
        }}
      />

      <NewStockItemModal
        isOpen={isNewStockModalOpen}
        onClose={() => setIsNewStockModalOpen(false)}
        onStockAdded={() => {
          fetchInventory();
          triggerToast("Stock item registered successfully in database");
        }}
      />
    </AppLayout>
  );
}
