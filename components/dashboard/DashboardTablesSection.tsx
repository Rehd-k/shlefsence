"use client";

import React, { useState } from "react";
import { LatestOrder, LowStockProduct, RecentPayment } from "@/lib/types/dashboard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ShoppingBag,
  AlertTriangle,
  CreditCard,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Search,
} from "lucide-react";
import { clsx } from "clsx";
import { formatCurrency } from "@/lib/utils/formatCurrency";

interface DashboardTablesSectionProps {
  orders: LatestOrder[];
  lowStockProducts: LowStockProduct[];
  payments: RecentPayment[];
  onRestockItem?: (item: LowStockProduct) => void;
  onViewOrderDetails?: (order: LatestOrder) => void;
}

export const DashboardTablesSection: React.FC<DashboardTablesSectionProps> = ({
  orders,
  lowStockProducts,
  payments,
  onRestockItem,
  onViewOrderDetails,
}) => {
  const [activeTab, setActiveTab] = useState<"orders" | "lowstock" | "payments">("orders");

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Operational Activity & Watchlist
          </h3>
          <span className="text-xs text-slate-400">High-density ERP tables</span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("orders")}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer",
              activeTab === "orders"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Latest Orders</span>
            <span className="ml-1 text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.2 rounded-full">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("lowstock")}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer",
              activeTab === "lowstock"
                ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Low Stock</span>
            <span className="ml-1 text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded-full">
              {lowStockProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer",
              activeTab === "payments"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
            <span>Recent Payments</span>
            <span className="ml-1 text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded-full">
              {payments.length}
            </span>
          </button>
        </div>
      </div>

      {/* Table 1: Latest Orders */}
      {activeTab === "orders" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] sticky top-0">
              <tr>
                <th className="px-4 py-3">Order Ref</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Fulfillment Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {ord.orderNumber}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {ord.customerName}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-semibold">
                      {ord.customerType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono">
                    {ord.itemsCount} pcs
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-white font-mono">
                    {formatCurrency(ord.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        ord.paymentStatus === "Paid"
                          ? "success"
                          : ord.paymentStatus === "Partial"
                          ? "warning"
                          : "danger"
                      }
                      size="sm"
                    >
                      {ord.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md",
                        ord.fulfillmentStatus === "Awaiting Dispatch" && "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
                        ord.fulfillmentStatus === "Processing" && "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
                        ord.fulfillmentStatus === "Dispatched" && "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
                        ord.fulfillmentStatus === "Delivered" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {ord.fulfillmentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onViewOrderDetails?.(ord)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition cursor-pointer"
                      title="Inspect Order Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Table 2: Low Stock Products */}
      {activeTab === "lowstock" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] sticky top-0">
              <tr>
                <th className="px-4 py-3">SKU & Part</th>
                <th className="px-4 py-3">Brand & Model</th>
                <th className="px-4 py-3">Quality</th>
                <th className="px-4 py-3">Current Stock</th>
                <th className="px-4 py-3">Reorder Point</th>
                <th className="px-4 py-3">Bin Location</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {lowStockProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900 dark:text-white">{prod.productName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{prod.sku}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{prod.phoneModel}</span>
                    <p className="text-[10px] text-slate-400">{prod.brand}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="purple" size="sm">
                      {prod.quality.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "font-extrabold text-sm font-mono px-2 py-0.5 rounded",
                        prod.currentStock === 0
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      )}
                    >
                      {prod.currentStock} units
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono font-bold">
                    {prod.reorderPoint} units
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {prod.warehouseBin}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<RefreshCw className="w-3 h-3 text-indigo-500" />}
                      onClick={() => onRestockItem?.(prod)}
                    >
                      Quick Restock PO
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Table 3: Recent Customer Payments */}
      {activeTab === "payments" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] sticky top-0">
              <tr>
                <th className="px-4 py-3">Payment Ref</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Invoice Ref</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {payments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {pay.paymentRef}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {pay.customerName}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">
                    {pay.invoiceRef}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-semibold">
                      {pay.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    +{formatCurrency(pay.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={pay.status === "Completed" ? "success" : "warning"} size="sm">
                      {pay.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[11px]">
                    {new Date(pay.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
