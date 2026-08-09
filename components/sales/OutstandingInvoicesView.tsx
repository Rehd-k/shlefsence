"use client";

import React, { useState, useMemo } from "react";
import { IInvoice } from "@/lib/types/sales";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  AlertTriangle,
  Clock,
  Send,
  CreditCard,
  Building2,
  DollarSign,
  ShieldAlert,
  Search,
  CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";
import { computeArAgeing } from "@/lib/utils/arAgeing";

interface OutstandingInvoicesViewProps {
  invoices: IInvoice[];
  onRecordPayment: (invoice: IInvoice) => void;
}

export const OutstandingInvoicesView: React.FC<OutstandingInvoicesViewProps> = ({
  invoices,
  onRecordPayment,
}) => {
  const [search, setSearch] = useState("");
  const [remindedInvoices, setRemindedInvoices] = useState<Record<string, boolean>>({});

  const unpaidInvoices = invoices.filter((inv) => inv.balanceDue > 0);
  const arAgeing = useMemo(() => computeArAgeing(unpaidInvoices), [unpaidInvoices]);
  const activeAccounts = useMemo(
    () => new Set(unpaidInvoices.map((inv) => inv.customerName)).size,
    [unpaidInvoices]
  );

  const filtered = unpaidInvoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendReminder = (invId: string, customerName: string) => {
    setRemindedInvoices((prev) => ({ ...prev, [invId]: true }));
  };

  return (
    <div className="space-y-6">
      {/* AR Aging Matrix Bucket Header */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* 1. Current 0-30 */}
        <Card className="p-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Current (0-30 Days)
          </span>
          <h4 className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            ${arAgeing.current.toLocaleString()}
          </h4>
          <span className="text-[10px] text-slate-400">Within terms</span>
        </Card>

        {/* 2. 31-60 Days */}
        <Card className="p-3 bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/50 shadow-sm">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            31-60 Days Overdue
          </span>
          <h4 className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
            ${arAgeing.days31to60.toLocaleString()}
          </h4>
          <span className="text-[10px] text-amber-600/80 font-semibold">1st Reminder Sent</span>
        </Card>

        {/* 3. 61-90 Days */}
        <Card className="p-3 bg-white dark:bg-slate-900 border-orange-200 dark:border-orange-900/50 shadow-sm">
          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">
            61-90 Days Overdue
          </span>
          <h4 className="text-lg font-black text-orange-600 dark:text-orange-400 font-mono mt-1">
            ${arAgeing.days61to90.toLocaleString()}
          </h4>
          <span className="text-[10px] text-orange-600 font-semibold">Credit Hold Risk</span>
        </Card>

        {/* 4. 90+ Days */}
        <Card className="p-3 bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/50 shadow-sm">
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
            90+ Days Overdue
          </span>
          <h4 className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
            ${arAgeing.overdue90Plus.toLocaleString()}
          </h4>
          <span className="text-[10px] text-rose-600 font-semibold">Critical Collections</span>
        </Card>

        {/* 5. Total AR */}
        <Card className="col-span-2 md:col-span-1 p-3 bg-slate-900 text-white border-slate-800 shadow-md">
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
            Total Outstanding AR
          </span>
          <h4 className="text-lg font-black text-white font-mono mt-1">
            ${arAgeing.totalOutstanding.toLocaleString()}
          </h4>
          <span className="text-[10px] text-slate-300 font-medium">
            {activeAccounts} Active Account{activeAccounts === 1 ? "" : "s"}
          </span>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search overdue customer, invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Outstanding Invoices Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3.5">Invoice #</th>
              <th className="px-4 py-3.5">Customer & Account</th>
              <th className="px-4 py-3.5">Due Date</th>
              <th className="px-4 py-3.5 text-right">Total Invoice</th>
              <th className="px-4 py-3.5 text-right">Balance Due ($)</th>
              <th className="px-4 py-3.5">AR Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((inv) => {
              const isReminded = remindedInvoices[inv.id];
              return (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{inv.customerName}</p>
                      <span className="text-[10px] text-slate-400">{inv.customerEmail}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px]">
                    <span className={clsx(inv.status === "Overdue" ? "text-rose-600 font-bold" : "text-slate-600")}>
                      {inv.dueDate}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                    ${inv.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                    ${inv.balanceDue.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={inv.status === "Overdue" ? "danger" : "warning"} size="sm">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant={isReminded ? "ghost" : "outline"}
                        size="sm"
                        disabled={isReminded}
                        icon={isReminded ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Send className="w-3.5 h-3.5 text-indigo-600" />}
                        onClick={() => handleSendReminder(inv.id, inv.customerName)}
                      >
                        {isReminded ? "Reminder Sent" : "Send Reminder"}
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<CreditCard className="w-3.5 h-3.5 text-emerald-600" />}
                        onClick={() => onRecordPayment(inv)}
                      >
                        Record Pay
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
