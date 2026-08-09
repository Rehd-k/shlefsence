"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocation } from "@/lib/context/LocationContext";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { DashboardMetricsGrid } from "@/components/dashboard/DashboardMetricsGrid";
import { QuickActionToolbar } from "@/components/dashboard/QuickActionToolbar";
import { DashboardChartsSection } from "@/components/dashboard/DashboardChartsSection";
import { DashboardTablesSection } from "@/components/dashboard/DashboardTablesSection";
import { CreateSaleModal } from "@/components/dashboard/modals/CreateSaleModal";
import { AddProductModal } from "@/components/dashboard/modals/AddProductModal";
import { CreatePOModal } from "@/components/dashboard/modals/CreatePOModal";
import { TransferStockModal } from "@/components/dashboard/modals/TransferStockModal";
import { ReceiveShipmentModal } from "@/components/dashboard/modals/ReceiveShipmentModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EMPTY_DASHBOARD_METRICS } from "@/lib/utils/emptyDashboard";
import {
  LatestOrder,
  LowStockProduct,
  RecentPayment,
  DailySalesPoint,
  MonthlyRevenuePoint,
  CategorySalesPoint,
  BrandSalesPoint,
  PhoneModelSalesPoint,
} from "@/lib/types/dashboard";
import { RefreshCcw, Calendar, Filter, Sparkles, CheckCircle, ArrowRight } from "lucide-react";

export default function ERPDashboardPage() {
  const [metrics, setMetrics] = useState(EMPTY_DASHBOARD_METRICS);
  const [dailySales, setDailySales] = useState<DailySalesPoint[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenuePoint[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySalesPoint[]>([]);
  const [topBrands, setTopBrands] = useState<BrandSalesPoint[]>([]);
  const [topModels, setTopModels] = useState<PhoneModelSalesPoint[]>([]);
  const [orders, setOrders] = useState<LatestOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [payments, setPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "quarter">("30d");
  const { activeLocation } = useLocation();

  // Quick Action Modal states
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

  // Toast alert state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard", { credentials: "include" });
      const json = await res.json();
      if (json.success && json.data) {
        setMetrics(json.data.metrics ?? EMPTY_DASHBOARD_METRICS);
        setDailySales(json.data.dailySales ?? []);
        setMonthlyRevenue(json.data.monthlyRevenue ?? []);
        setCategorySales(json.data.categorySales ?? []);
        setTopBrands(json.data.topBrands ?? []);
        setTopModels(json.data.topModels ?? []);
        setOrders(json.data.latestOrders ?? []);
        setLowStockProducts(json.data.lowStockProducts ?? []);
        setPayments(json.data.recentPayments ?? []);
      } else {
        setError(json.error || "Failed to load dashboard data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick Action Handlers
  const handleSaleCreated = (newSale: LatestOrder) => {
    setOrders((prev) => [newSale, ...prev]);
    setMetrics((prev) => ({
      ...prev,
      revenueToday: {
        ...prev.revenueToday,
        amount: prev.revenueToday.amount + newSale.totalAmount,
      },
      recentSales: {
        ...prev.recentSales,
        countToday: prev.recentSales.countToday + 1,
      },
    }));
    triggerToast(`Sales Order ${newSale.orderNumber} issued successfully (${formatCurrency(newSale.totalAmount)})`);
  };

  const handleProductAdded = (prod: any) => {
    triggerToast(`New Catalog Item "${prod.product}" (${prod.sku}) registered.`);
  };

  const handlePOCreated = (po: any) => {
    setMetrics((prev) => ({
      ...prev,
      pendingPOs: {
        ...prev.pendingPOs,
        count: prev.pendingPOs.count + 1,
        totalValue: prev.pendingPOs.totalValue + po.totalValue,
      },
    }));
    triggerToast(`Purchase Order ${po.poNumber} sent to ${po.supplier} (${formatCurrency(po.totalValue)})`);
  };

  const handleTransferCompleted = (transfer: any) => {
    triggerToast(`Stock Transfer Logged: ${transfer.quantity} units of ${transfer.sku} transferred to ${transfer.toWarehouse}.`);
  };

  const handleShipmentReceived = (receipt: any) => {
    setMetrics((prev) => ({
      ...prev,
      pendingPOs: {
        ...prev.pendingPOs,
        count: Math.max(0, prev.pendingPOs.count - 1),
      },
      inventoryValue: {
        ...prev.inventoryValue,
        totalValue: prev.inventoryValue.totalValue + receipt.receivedQty * 45,
      },
    }));
    triggerToast(`Received ${receipt.receivedQty} units for PO ${receipt.poNumber} into Bin ${receipt.targetBin}.`);
  };

  // Quick Action Trigger from AppLayout or Buttons
  const handleLayoutQuickAction = (key: string) => {
    if (key === "create-sale") setIsSaleModalOpen(true);
    if (key === "add-product") setIsAddProductModalOpen(true);
    if (key === "create-po") setIsPOModalOpen(true);
    if (key === "transfer-stock") setIsTransferModalOpen(true);
    if (key === "receive-shipment") setIsReceiveModalOpen(true);
  };

  return (
    <AppLayout
      onQuickAction={handleLayoutQuickAction}
    >
      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Toast Confirmation Overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/40 flex items-center gap-3 text-xs font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Executive Dashboard
            </h1>
            <Badge variant="purple" size="sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> Live Telemetry
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time business health, multi-hub stock telemetry, revenue velocity, and quick ERP actions.
          </p>
        </div>

        {/* Filter Controls & Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Filter Pills */}
          <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs">
            {(["today", "7d", "30d", "quarter"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition uppercase cursor-pointer ${timeRange === range
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
            onClick={() => {
              fetchDashboardData();
              triggerToast("Dashboard data re-synchronized with Mongoose database.");
            }}
          >
            Refresh Data
          </Button>

          <Link href="/inventory">
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Inventory Suite
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Quick Action Control Bar */}
      <QuickActionToolbar
        onCreateSale={() => setIsSaleModalOpen(true)}
        onAddProduct={() => setIsAddProductModalOpen(true)}
        onCreatePO={() => setIsPOModalOpen(true)}
        onTransferStock={() => setIsTransferModalOpen(true)}
        onReceiveShipment={() => setIsReceiveModalOpen(true)}
      />

      {/* 2. 13 Business Health Indicator Cards */}
      <DashboardMetricsGrid metrics={metrics} />

      {/* 3. Interactive Charts (Daily Sales, Monthly Revenue, Category Sales, Top Brands, Top Models) */}
      <DashboardChartsSection
        dailySales={dailySales}
        monthlyRevenue={monthlyRevenue}
        categorySales={categorySales}
        topBrands={topBrands}
        topModels={topModels}
      />

      {/* 4. ERP Operational Tables (Latest Orders, Low Stock Watchlist, Customer Payments) */}
      <DashboardTablesSection
        orders={orders}
        lowStockProducts={lowStockProducts}
        payments={payments}
        onRestockItem={(prod) => {
          setIsPOModalOpen(true);
        }}
        onViewOrderDetails={(ord) => {
          triggerToast(`Inspecting Order Details for ${ord.orderNumber}`);
        }}
      />

      {/* MODAL DIALOGS */}
      <CreateSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSaleCreated={handleSaleCreated}
      />

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={handleProductAdded}
      />

      <CreatePOModal
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        onPOCreated={handlePOCreated}
      />

      <TransferStockModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onTransferCompleted={handleTransferCompleted}
      />

      <ReceiveShipmentModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        onShipmentReceived={handleShipmentReceived}
      />
    </AppLayout>
  );
}
