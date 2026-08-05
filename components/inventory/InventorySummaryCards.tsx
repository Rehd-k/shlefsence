import React from "react";
import {
  PackageCheck,
  CircleDollarSign,
  AlertTriangle,
  Clock,
  TrendingUp,
  Truck,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InventorySummary } from "@/lib/types/inventory";
import { formatCurrency } from "@/lib/utils/formatCurrency";

export interface InventorySummaryCardsProps {
  summary: InventorySummary;
  onFilterByStatus?: (status: string) => void;
}

export const InventorySummaryCards: React.FC<InventorySummaryCardsProps> = ({
  summary,
  onFilterByStatus,
}) => {
  const cards = [
    {
      id: "totalStock",
      title: "Total Stock",
      value: summary.totalStock.units.toLocaleString() + " units",
      subtitle: `${summary.totalStock.skus} active SKUs`,
      icon: PackageCheck,
      iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400",
      badge: (
        <Badge variant="success" size="sm">
          <TrendingUp className="w-3 h-3" /> +{summary.totalStock.trendPercentage}% mo/mo
        </Badge>
      ),
      clickableStatus: null,
    },
    {
      id: "inventoryValue",
      title: "Inventory Value",
      value: formatCurrency(summary.inventoryValue.totalValue),
      subtitle: `Cost Basis: ${formatCurrency(summary.inventoryValue.totalCost)}`,
      icon: CircleDollarSign,
      iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
      badge: (
        <Badge variant="purple" size="sm">
          Prof. Margin: +{formatCurrency(summary.inventoryValue.potentialProfit)}
        </Badge>
      ),
      clickableStatus: null,
    },
    {
      id: "lowStock",
      title: "Low Stock",
      value: `${summary.lowStock.count} SKUs`,
      subtitle: `${summary.lowStock.criticalCount} critical out of stock`,
      icon: AlertTriangle,
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
      badge: (
        <Badge variant="warning" size="sm" dot>
          Restock Action
        </Badge>
      ),
      clickableStatus: "LOW_STOCK",
    },
    {
      id: "deadStock",
      title: "Dead Stock (>90d)",
      value: `${summary.deadStock.count} SKUs`,
      subtitle: `${formatCurrency(summary.deadStock.tiedCapital)} tied capital`,
      icon: Clock,
      iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
      badge: (
        <Badge variant="danger" size="sm">
          <ShieldAlert className="w-3 h-3" /> Action Needed
        </Badge>
      ),
      clickableStatus: "DEAD_STOCK",
    },
    {
      id: "incomingStock",
      title: "Incoming Stock",
      value: `${summary.incomingStock.units.toLocaleString()} units`,
      subtitle: `${summary.incomingStock.expectedPOs} Pending Purchase Orders`,
      icon: Truck,
      iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400",
      badge: (
        <Badge variant="info" size="sm">
          In Transit
        </Badge>
      ),
      clickableStatus: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card
            key={c.id}
            hoverable={!!c.clickableStatus}
            onClick={() => c.clickableStatus && onFilterByStatus && onFilterByStatus(c.clickableStatus)}
            className="p-4 flex flex-col justify-between gap-3 relative overflow-hidden group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-xl ${c.iconBg} shrink-0`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {c.title}
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                    {c.value}
                  </span>
                </div>
              </div>
              {c.clickableStatus && (
                <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {c.subtitle}
              </span>
              <div className="shrink-0">{c.badge}</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
