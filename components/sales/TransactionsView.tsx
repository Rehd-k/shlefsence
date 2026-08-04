"use client";

import React, { useState } from "react";
import { IReceipt } from "@/lib/types/sales";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatNaira } from "@/lib/utils/formatCurrency";
import {
  Calendar,
  Search,
  Filter,
  ShoppingBag,
  TrendingUp,
  User,
  CreditCard,
  Printer,
  FileText,
  Building2,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

interface TransactionsViewProps {
  receipts: IReceipt[];
  onViewReceipt: (receipt: IReceipt) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ receipts, onViewReceipt }) => {
  const [dateRange, setDateRange] = useState<"today" | "7d" | "30d" | "all">("all");
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [cashierFilter, setCashierFilter] = useState("ALL");

  // Filter receipts by date range, search, payment method, cashier
  const filteredReceipts = receipts.filter((rcp) => {
    const matchesSearch =
      rcp.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      rcp.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      rcp.customerName.toLowerCase().includes(search.toLowerCase()) ||
      rcp.cashierName.toLowerCase().includes(search.toLowerCase()) ||
      rcp.itemsSummary.toLowerCase().includes(search.toLowerCase());

    const matchesPayment = paymentFilter === "ALL" || rcp.paymentMethod === paymentFilter;
    const matchesCashier = cashierFilter === "ALL" || rcp.cashierName === cashierFilter;

    let matchesDate = true;
    if (dateRange !== "all") {
      const receiptDate = new Date(rcp.timestamp);
      const now = new Date();
      if (dateRange === "today") {
        matchesDate = receiptDate.toDateString() === now.toDateString();
      } else if (dateRange === "7d") {
        const diffDays = (now.getTime() - receiptDate.getTime()) / (1000 * 3600 * 24);
        matchesDate = diffDays <= 7;
      } else if (dateRange === "30d") {
        const diffDays = (now.getTime() - receiptDate.getTime()) / (1000 * 3600 * 24);
        matchesDate = diffDays <= 30;
      }
    }

    return matchesSearch && matchesPayment && matchesCashier && matchesDate;
  });

  // Calculate metrics
  const totalSalesCount = filteredReceipts.length;
  const totalRevenue = filteredReceipts.reduce((acc, r) => acc + r.totalAmount, 0);
  const avgOrderValue = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

  // Unique cashiers for filter
  const cashiers = Array.from(new Set(receipts.map((r) => r.cashierName)));

  return (
    <div className="space-y-6">
      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales Count</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">{totalSalesCount} Sales</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            Range: {dateRange.toUpperCase()}
          </span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue (₦)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">{formatNaira(totalRevenue)}</p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">
            Settled Invoices & POS Receipts
          </span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Order Value</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">{formatNaira(avgOrderValue)}</p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">Per Transaction</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Staff Cashiers</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">{cashiers.length} Sellers</p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">Tracked POS Users</span>
        </Card>
      </div>

      {/* Toolbar: Search & Range Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by receipt #, seller name, customer, items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 border border-slate-200/80 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Date Range Selector */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            {(["today", "7d", "30d", "all"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition uppercase cursor-pointer ${
                  dateRange === r
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Seller Filter */}
          <select
            value={cashierFilter}
            onChange={(e) => setCashierFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Sellers / Staff</option>
            {cashiers.map((c) => (
              <option key={c} value={c}>
                👤 {c}
              </option>
            ))}
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="Cash">💵 Cash</option>
            <option value="Credit Card">💳 Credit Card</option>
            <option value="Credit Line">🏢 Credit Line</option>
          </select>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Receipt / Inv #</th>
                <th className="px-4 py-3">Seller (Who Made It)</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Items Summary</th>
                <th className="px-4 py-3 text-right">Amount (₦)</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400 font-medium">
                    No sales transactions match the selected date range or filters.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rcp) => (
                  <tr key={rcp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {rcp.timestamp ? rcp.timestamp.substring(0, 16).replace("T", " ") : "2026-08-01 10:30"}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {rcp.receiptNumber}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center">
                        {rcp.cashierName.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{rcp.cashierName}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {rcp.customerName}
                      <span className="block text-[10px] text-slate-400">{rcp.customerType}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                      {rcp.storeName || "Main Hub - Lagos"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral" size="sm">
                        {rcp.paymentMethod}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                      {rcp.itemsSummary}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black text-slate-900 dark:text-white">
                      {formatNaira(rcp.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="xs"
                        variant="outline"
                        icon={<Printer className="w-3.5 h-3.5 text-indigo-600" />}
                        onClick={() => onViewReceipt(rcp)}
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
