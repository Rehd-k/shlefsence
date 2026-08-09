"use client";

import React, { useState } from "react";
import { IReceipt } from "@/lib/types/sales";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Search, Receipt, Printer, Eye, Store } from "lucide-react";
interface ReceiptsViewProps {
  receipts: IReceipt[];
  onViewReceipt: (receipt: IReceipt) => void;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({ receipts, onViewReceipt }) => {
  const [search, setSearch] = useState("");

  const filtered = receipts.filter(
    (r) =>
      r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search thermal receipts by receipt #, customer..."
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
              <th className="px-4 py-3.5">Receipt #</th>
              <th className="px-4 py-3.5">Invoice Ref</th>
              <th className="px-4 py-3.5">Customer & Channel</th>
              <th className="px-4 py-3.5">Purchased Summary</th>
              <th className="px-4 py-3.5 text-right">Total ($)</th>
              <th className="px-4 py-3.5 text-right">Date & Cashier</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((rec) => (
              <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                  {rec.receiptNumber}
                </td>
                <td className="px-4 py-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  {rec.invoiceNumber}
                </td>
                <td className="px-4 py-3.5">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{rec.customerName}</p>
                    <Badge variant="purple" size="sm">{rec.customerType}</Badge>
                  </div>
                </td>
                <td className="px-4 py-3.5 max-w-60 truncate text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                  {rec.itemsSummary}
                </td>
                <td className="px-4 py-3.5 text-right font-extrabold text-slate-900 dark:text-white font-mono text-sm">
                  ${rec.totalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <span className="text-[11px] text-slate-500 font-mono block">{rec.timestamp.substring(0, 10)}</span>
                  <span className="text-[10px] text-slate-400">by {rec.cashierName}</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Printer className="w-3.5 h-3.5 text-amber-600" />}
                    onClick={() => onViewReceipt(rec)}
                  >
                    View / Print 80mm
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
