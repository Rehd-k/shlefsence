"use client";

import React, { useState } from "react";
import { IInvoice, InvoiceStatus } from "@/lib/types/sales";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  Printer,
  CreditCard,
  Building2,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Download,
  ExternalLink,
} from "lucide-react";
import { clsx } from "clsx";

interface InvoicesViewProps {
  invoices: IInvoice[];
  onRecordPayment: (invoice: IInvoice) => void;
  onPrintInvoice: (invoice: IInvoice) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  onRecordPayment,
  onPrintInvoice,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>("inv-9401"); // default first expanded for demonstration

  const toggleExpand = (id: string) => {
    setExpandedInvoiceId(expandedInvoiceId === id ? null : id);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.orderNumber.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || inv.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: InvoiceStatus) => {
    switch (status) {
      case "Paid":
        return "success";
      case "Partial":
        return "warning";
      case "Overdue":
        return "danger";
      case "Unpaid":
        return "neutral";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by invoice #, customer name, order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Buttons */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {["ALL", "PAID", "PARTIAL", "OVERDUE"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={clsx(
                  "px-3 py-1 text-xs font-bold rounded-lg transition uppercase cursor-pointer",
                  statusFilter === st
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Invoice Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="w-10 px-3 py-3.5 text-center"></th>
              <th className="px-4 py-3.5">Invoice #</th>
              <th className="px-4 py-3.5">Customer</th>
              <th className="px-4 py-3.5">Dates</th>
              <th className="px-4 py-3.5 text-right">Total ($)</th>
              <th className="px-4 py-3.5 text-right">Paid / Balance</th>
              <th className="px-4 py-3.5">Payment</th>
              <th className="px-4 py-3.5">Fulfillment</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredInvoices.map((inv) => {
              const isExpanded = expandedInvoiceId === inv.id;
              return (
                <React.Fragment key={inv.id}>
                  {/* Summary Row */}
                  <tr
                    onClick={() => toggleExpand(inv.id)}
                    className={clsx(
                      "group cursor-pointer transition-colors",
                      isExpanded
                        ? "bg-indigo-50/40 dark:bg-indigo-950/20"
                        : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    )}
                  >
                    {/* Expand Toggle */}
                    <td className="px-3 py-3.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(inv.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 group-hover:text-indigo-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Invoice # */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                          {inv.invoiceNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Ref: {inv.orderNumber}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {inv.customerName}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="purple" size="sm" className="text-[10px] py-0">
                            {inv.customerType}
                          </Badge>
                        </div>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Issued: {inv.issueDate}</span>
                        <span className={clsx(inv.status === "Overdue" && "text-rose-600 font-bold")}>
                          Due: {inv.dueDate}
                        </span>
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3.5 text-right font-extrabold text-slate-900 dark:text-white font-mono text-sm">
                      ${inv.totalAmount.toFixed(2)}
                    </td>

                    {/* Paid / Balance */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex flex-col font-mono text-[11px]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          ${inv.paidAmount.toFixed(2)} paid
                        </span>
                        {inv.balanceDue > 0 ? (
                          <span className="text-rose-600 font-bold">
                            ${inv.balanceDue.toFixed(2)} due
                          </span>
                        ) : (
                          <span className="text-slate-400">$0.00 due</span>
                        )}
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td className="px-4 py-3.5">
                      <Badge variant={getStatusBadgeVariant(inv.status)} size="sm">
                        {inv.status}
                      </Badge>
                    </td>

                    {/* Fulfillment Status */}
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {inv.fulfillmentStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Printer className="w-3.5 h-3.5" />}
                          onClick={() => onPrintInvoice(inv)}
                          title="Print / Export Invoice PDF"
                        />
                        {inv.balanceDue > 0 && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<CreditCard className="w-3.5 h-3.5 text-emerald-600" />}
                            onClick={() => onRecordPayment(inv)}
                          >
                            Pay
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDABLE ROW DETAILS */}
                  {isExpanded && (
                    <tr className="bg-slate-50/90 dark:bg-slate-900/90 border-b border-indigo-100 dark:border-indigo-950">
                      <td colSpan={9} className="p-4 sm:p-6">
                        <div className="bg-white dark:bg-slate-950 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-inner">
                          {/* Top Info Banner */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
                            <div>
                              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
                                Customer Contact & Billed To
                              </span>
                              <p className="font-bold text-slate-900 dark:text-white text-sm">{inv.customerName}</p>
                              <p className="text-slate-500">{inv.customerEmail}</p>
                              <p className="text-slate-500">{inv.customerPhone || "N/A"}</p>
                            </div>

                            <div>
                              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
                                Shipping Destination & Warehouse
                              </span>
                              <p className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {inv.shippingAddress || "Counter Pickup"}
                              </p>
                              <p className="text-slate-500 mt-1">
                                Origin Hub: <strong className="text-slate-800 dark:text-slate-200">{inv.warehouse}</strong>
                              </p>
                            </div>

                            <div>
                              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
                                Payment Terms & Method
                              </span>
                              <p className="text-slate-800 dark:text-slate-200 font-bold">{inv.paymentMethod}</p>
                              <p className="text-slate-500 text-[11px] mt-0.5">{inv.notes || "No special terms."}</p>
                            </div>
                          </div>

                          {/* Itemized Parts Table */}
                          <div>
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                              <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Itemized Parts Breakdown ({inv.items.length} items)
                            </h4>
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                                  <tr>
                                    <th className="px-3 py-2.5">Part / SKU</th>
                                    <th className="px-3 py-2.5">Quality Grade</th>
                                    <th className="px-3 py-2.5">Warehouse Bin</th>
                                    <th className="px-3 py-2.5 text-center">Qty</th>
                                    <th className="px-3 py-2.5 text-right">Unit Price</th>
                                    <th className="px-3 py-2.5 text-right">Discount</th>
                                    <th className="px-3 py-2.5 text-right">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                                  {inv.items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                      <td className="px-3 py-2.5">
                                        <div className="flex items-center gap-2.5">
                                          {item.image ? (
                                            <img
                                              src={item.image}
                                              alt={item.name}
                                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                                            />
                                          ) : (
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                                              {item.sku.substring(0, 3)}
                                            </div>
                                          )}
                                          <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                                            <p className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{item.sku}</p>
                                          </div>
                                        </div>
                                      </td>

                                      <td className="px-3 py-2.5">
                                        <Badge variant="neutral" size="sm" className="text-[10px]">
                                          {item.quality.replace("_", " ")}
                                        </Badge>
                                      </td>

                                      <td className="px-3 py-2.5 font-mono text-[11px] text-slate-500">
                                        {item.warehouseSource}
                                      </td>

                                      <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-900 dark:text-white">
                                        {item.quantity} pcs
                                      </td>

                                      <td className="px-3 py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                                        ${item.unitPrice.toFixed(2)}
                                      </td>

                                      <td className="px-3 py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                        {item.discountPercentage > 0 ? `-${item.discountPercentage}%` : "—"}
                                      </td>

                                      <td className="px-3 py-2.5 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                                        ${item.lineTotal.toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Bottom Row: Payments Audit History + Invoice Financial Totals */}
                          <div className="flex flex-col md:flex-row items-start justify-between gap-6 pt-2">
                            {/* Payment History Log */}
                            <div className="flex-1 space-y-2">
                              <h5 className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" /> Payment Clearing Audit Logs ({inv.payments.length})
                              </h5>
                              {inv.payments.length > 0 ? (
                                <div className="space-y-1.5">
                                  {inv.payments.map((p) => (
                                    <div
                                      key={p.id}
                                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                                    >
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        <div>
                                          <span className="font-bold text-slate-900 dark:text-white font-mono">{p.paymentRef}</span>
                                          <span className="text-[10px] text-slate-400 ml-2">via {p.method}</span>
                                        </div>
                                      </div>
                                      <div className="text-right font-mono">
                                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">${p.amount.toFixed(2)}</span>
                                        <span className="text-[10px] text-slate-400 block">{p.date.substring(0, 10)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">No payments recorded for this invoice yet.</p>
                              )}
                            </div>

                            {/* Financial Summary */}
                            <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-mono">
                              <div className="flex justify-between text-slate-500">
                                <span>Subtotal:</span>
                                <span>${inv.subtotal.toFixed(2)}</span>
                              </div>
                              {inv.discountTotal > 0 && (
                                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                  <span>Total Discount:</span>
                                  <span>-${inv.discountTotal.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-slate-500">
                                <span>Tax:</span>
                                <span>${inv.taxAmount.toFixed(2)}</span>
                              </div>
                              <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between font-bold text-slate-900 dark:text-white text-sm">
                                <span>Total Amount:</span>
                                <span>${inv.totalAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                                <span>Amount Paid:</span>
                                <span>${inv.paidAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-rose-600 font-bold text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
                                <span>Balance Due:</span>
                                <span>${inv.balanceDue.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
