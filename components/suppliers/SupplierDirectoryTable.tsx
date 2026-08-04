"use client";

import React, { useState } from "react";
import { ISupplier } from "@/lib/types/supplier";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Truck,
  Mail,
  Phone,
  Search,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  MapPin,
  Building,
  FileText,
  MessageSquarePlus,
  Paperclip,
} from "lucide-react";

interface SupplierDirectoryTableProps {
  suppliers: ISupplier[];
  loading?: boolean;
  onSelectSupplier: (supplier: ISupplier) => void;
  onLogCommunication: (supplier: ISupplier) => void;
  onAttachDocument: (supplier: ISupplier) => void;
}

export const SupplierDirectoryTable: React.FC<SupplierDirectoryTableProps> = ({
  suppliers,
  loading,
  onSelectSupplier,
  onLogCommunication,
  onAttachDocument,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  const filteredSuppliers = suppliers.filter((sup) => {
    const matchesSearch =
      search === "" ||
      sup.name.toLowerCase().includes(search.toLowerCase()) ||
      (sup.code && sup.code.toLowerCase().includes(search.toLowerCase())) ||
      (sup.contact && sup.contact.toLowerCase().includes(search.toLowerCase())) ||
      (sup.email && sup.email.toLowerCase().includes(search.toLowerCase())) ||
      (sup.industry && sup.industry.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || sup.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Table Top Controls & Search Bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter suppliers by name, code, rep..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Status:
          </span>
          {["ALL", "Preferred", "Active", "Under Review"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                statusFilter === st
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
              <th className="py-3 px-4">Supplier / Vendor</th>
              <th className="py-3 px-4">Primary Contact</th>
              <th className="py-3 px-4">Tier & Rating</th>
              <th className="py-3 px-4">Lead Time</th>
              <th className="py-3 px-4">Active POs</th>
              <th className="py-3 px-4">Outstanding Balance</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Loading supplier directory...
                </td>
              </tr>
            ) : filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No suppliers matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((sup) => (
                <tr
                  key={sup.id || sup.name}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                >
                  {/* Supplier / Vendor */}
                  <td className="py-3.5 px-4">
                    <div
                      onClick={() => onSelectSupplier(sup)}
                      className="flex items-start gap-3 cursor-pointer group-hover:text-indigo-600 transition"
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{sup.name}</span>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700">
                            {sup.code || "SUP-1000"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                          {sup.companyName || sup.industry}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Primary Contact */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {sup.contact || sup.contacts?.[0]?.name || "Key Account Rep"}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[130px]">
                            {sup.email || sup.contacts?.[0]?.email || "orders@vendor.com"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Tier & Rating */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      <Badge
                        variant={
                          sup.status === "Preferred"
                            ? "success"
                            : sup.status === "Active"
                            ? "purple"
                            : "warning"
                        }
                        size="sm"
                      >
                        {sup.status}
                      </Badge>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {sup.rating || "98.5% Quality"}
                      </span>
                    </div>
                  </td>

                  {/* Lead Time */}
                  <td className="py-3.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                    {sup.leadTime || "4 Days"}
                  </td>

                  {/* Active POs */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {sup.activePOs || 0} POs
                    </span>
                  </td>

                  {/* Outstanding Balance */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(sup.outstandingBalance || 0)}
                    </div>
                    {sup.pendingInvoicesCount > 0 && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                        {sup.pendingInvoicesCount} Pending Invoices
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={<MessageSquarePlus className="w-3.5 h-3.5 text-slate-500" />}
                        title="Log Interaction"
                        onClick={() => onLogCommunication(sup)}
                      />
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={<Paperclip className="w-3.5 h-3.5 text-slate-500" />}
                        title="Attach Document"
                        onClick={() => onAttachDocument(sup)}
                      />
                      <Button
                        variant="outline"
                        size="xs"
                        icon={<ExternalLink className="w-3 h-3" />}
                        onClick={() => onSelectSupplier(sup)}
                      >
                        Profile
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
