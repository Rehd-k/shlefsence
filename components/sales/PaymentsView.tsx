"use client";

import React, { useState } from "react";
import { IPaymentRecord } from "@/lib/types/sales";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Search, CreditCard, Plus, CheckCircle2, Clock, ShieldCheck, Building2, Banknote } from "lucide-react";
import { SEED_PAYMENTS } from "@/lib/seed/salesSeedData";

interface PaymentsViewProps {
  payments: IPaymentRecord[];
  onRecordNewPayment: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ payments, onRecordNewPayment }) => {
  const [search, setSearch] = useState("");

  const filtered = payments.filter(
    (p) =>
      p.paymentRef.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "Cash":
        return <Banknote className="w-3.5 h-3.5 text-emerald-500" />;
      case "Credit Card":
      case "Stripe":
        return <CreditCard className="w-3.5 h-3.5 text-indigo-500" />;
      case "Bank Transfer":
      case "Credit Line":
        return <Building2 className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <CreditCard className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Search & Record Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search payment reference #, customer name, invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          />
        </div>

        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={onRecordNewPayment}>
          Record Incoming Payment
        </Button>
      </div>

      {/* Payment Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3.5">Payment Ref #</th>
              <th className="px-4 py-3.5">Invoice Ref</th>
              <th className="px-4 py-3.5">Customer Name</th>
              <th className="px-4 py-3.5">Payment Method</th>
              <th className="px-4 py-3.5 text-right">Amount ($)</th>
              <th className="px-4 py-3.5">Clearing Status</th>
              <th className="px-4 py-3.5 text-right">Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((pay) => (
              <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                  {pay.paymentRef}
                </td>
                <td className="px-4 py-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  {pay.invoiceNumber}
                </td>
                <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{pay.customerName}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    {getMethodIcon(pay.method)}
                    <span>{pay.method}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  ${pay.amount.toFixed(2)}
                </td>
                <td className="px-4 py-3.5">
                  <Badge variant={pay.status === "Completed" ? "success" : "warning"} size="sm">
                    {pay.status}
                  </Badge>
                </td>
                <td className="px-4 py-3.5 text-right text-[11px] text-slate-500 font-mono">
                  {pay.date.replace("T", " ").substring(0, 16)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
