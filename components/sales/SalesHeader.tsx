"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart3,
  FileText,
  Zap,
  Building2,
  UserCheck,
  CreditCard,
  Receipt,
  AlertCircle,
  Plus,
  History,
} from "lucide-react";
import { clsx } from "clsx";

export type SalesTab =
  | "dashboard"
  | "invoices"
  | "pos"
  | "transactions"
  | "wholesale"
  | "retail"
  | "payments"
  | "receipts"
  | "outstanding";

interface SalesHeaderProps {
  activeTab: SalesTab;
  onTabChange: (tab: SalesTab) => void;
  onNewSale: () => void;
  onLaunchPOS: () => void;
  onRecordPayment: () => void;
  outstandingCount?: number;
  unpaidInvoicesCount?: number;
}

export const SalesHeader: React.FC<SalesHeaderProps> = ({
  activeTab,
  onTabChange,
  onNewSale,
  onLaunchPOS,
  onRecordPayment,
  outstandingCount = 4,
  unpaidInvoicesCount = 2,
}) => {
  const tabs: { id: SalesTab; label: string; icon: React.ElementType; badge?: string | number; badgeVariant?: any }[] = [
    { id: "dashboard", label: "Overview", icon: BarChart3 },
    { id: "pos", label: "POS Speed Desk", icon: Zap, badge: "LIVE", badgeVariant: "purple" },
    { id: "transactions", label: "Sales Transactions Log", icon: History, badge: "NEW", badgeVariant: "purple" },
    { id: "invoices", label: "Invoices", icon: FileText, badge: "5 Active", badgeVariant: "neutral" },
    { id: "wholesale", label: "Wholesale Orders", icon: Building2, badge: "B2B", badgeVariant: "neutral" },
    { id: "retail", label: "Retail Orders", icon: UserCheck },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "receipts", label: "Receipts Log", icon: Receipt },
    {
      id: "outstanding",
      label: "Outstanding AR",
      icon: AlertCircle,
      badge: outstandingCount > 0 ? `₦48.9M (${outstandingCount})` : undefined,
      badgeVariant: "warning",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Title & Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Sales & Order Management
            </h1>
            <Badge variant="purple" size="sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Multichannel Hub
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage wholesale orders, counter POS transactions, invoice lifecycles, payments & AR aging in Naira (₦).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            icon={<Zap className="w-3.5 h-3.5 fill-current text-amber-300" />}
            onClick={onLaunchPOS}
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-md shadow-amber-600/20"
          >
            Launch POS
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<CreditCard className="w-3.5 h-3.5" />}
            onClick={onRecordPayment}
          >
            Record Payment
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={onNewSale}
          >
            Create New Invoice
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap border-b-2 cursor-pointer",
                isActive
                  ? "border-indigo-600 text-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
              )}
            >
              <Icon className={clsx("w-4 h-4", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} />
              <span>{tab.label}</span>

              {tab.badge && (
                <Badge
                  variant={isActive ? "purple" : (tab.badgeVariant as any) || "neutral"}
                  size="sm"
                  className="ml-1 text-[10px] py-0 px-1.5"
                >
                  {tab.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
