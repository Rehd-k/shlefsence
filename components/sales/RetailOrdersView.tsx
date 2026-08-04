"use client";

import React, { useState } from "react";
import { IInvoice } from "@/lib/types/sales";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Search, UserCheck, Wrench, Receipt, Printer, ShieldCheck } from "lucide-react";

interface RetailOrdersViewProps {
  invoices: IInvoice[];
  onPrintReceipt: (invoice: IInvoice) => void;
}

export const RetailOrdersView: React.FC<RetailOrdersViewProps> = ({ invoices, onPrintReceipt }) => {
  const [search, setSearch] = useState("");

  const retailInvoices = invoices.filter(
    (inv) => inv.customerType === "Retail Repair" || inv.customerType === "POS Quick Sale"
  );

  const filtered = retailInvoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search retail repair orders by receipt #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3.5">Order / Invoice #</th>
              <th className="px-4 py-3.5">Customer Details</th>
              <th className="px-4 py-3.5">Items Count</th>
              <th className="px-4 py-3.5 text-right">Amount ($)</th>
              <th className="px-4 py-3.5">Payment</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {inv.invoiceNumber}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white">{inv.customerName}</span>
                    <span className="text-[11px] text-slate-400">{inv.customerPhone || "Walk-in Counter"}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono">{inv.items.length} parts</td>
                <td className="px-4 py-3.5 text-right font-extrabold text-slate-900 dark:text-white font-mono">
                  ${inv.totalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3.5">
                  <Badge variant={inv.status === "Paid" ? "success" : "warning"} size="sm">
                    {inv.status} ({inv.paymentMethod})
                  </Badge>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Receipt className="w-3.5 h-3.5" />}
                    onClick={() => onPrintReceipt(inv)}
                  >
                    Thermal Receipt
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
