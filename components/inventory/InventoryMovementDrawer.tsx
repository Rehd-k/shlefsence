"use client";

import React, { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { IInventoryItem, IInventoryMovement, MovementType } from "@/lib/types/inventory";
import {
  History,
  Package,
  MapPin,
  Barcode as BarcodeIcon,
  Building2,
  UserCheck,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  PlusCircle,
  Truck,
  ShieldCheck,
} from "lucide-react";
import Barcode from "react-barcode";

export interface InventoryMovementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: IInventoryItem | null;
  movements: IInventoryMovement[];
  onQuickAdjust?: (item: IInventoryItem) => void;
}

export const InventoryMovementDrawer: React.FC<InventoryMovementDrawerProps> = ({
  isOpen,
  onClose,
  item,
  movements,
  onQuickAdjust,
}) => {
  const [activeTab, setActiveTab] = useState<string>("history");

  if (!item) return null;

  const movementBadges = {
    RECEIPT: { label: "PO Receipt", variant: "success" as const, icon: ArrowDownLeft },
    SALE: { label: "Fulfillment Sale", variant: "info" as const, icon: ArrowUpRight },
    TRANSFER: { label: "Hub Transfer", variant: "purple" as const, icon: RefreshCw },
    ADJUSTMENT: { label: "Audit Count", variant: "warning" as const, icon: PlusCircle },
    DAMAGE: { label: "Damage Write-off", variant: "danger" as const, icon: ShieldCheck },
    INITIAL_IMPORT: { label: "Initial Seed", variant: "neutral" as const, icon: Truck },
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={item.sku}
      subtitle={item.product}
      width="xl"
    >
      <div className="space-y-6">
        {/* Top Product Summary Card */}
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {item.brand} {item.phoneModel}
                </span>
                <Badge variant="purple" size="sm">
                  {item.quality.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">{item.category} • Supplier: {item.supplier}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<PlusCircle className="w-3.5 h-3.5" />}
              onClick={() => onQuickAdjust && onQuickAdjust(item)}
            >
              Adjust Qty
            </Button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700 text-center">
            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">On Hand</span>
              <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">{item.quantity}</p>
            </div>
            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Reserved</span>
              <p className="text-base font-bold text-slate-600 dark:text-slate-400">{item.reserved}</p>
            </div>
            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Available</span>
              <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {item.available ?? Math.max(0, item.quantity - item.reserved)}
              </p>
            </div>
            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Unit Cost</span>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">${item.cost.toFixed(2)}</p>
            </div>
          </div>

          {/* Location & Barcode details */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-1.5 font-medium">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span>{item.warehouse}</span>
              <span className="font-mono px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-bold text-slate-800 dark:text-slate-200">
                {item.shelf}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <BarcodeIcon className="w-4 h-4 text-slate-400" />
              <span className="font-mono text-slate-500">{item.barcode}</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <Tabs
          tabs={[
            { id: "history", label: "Inventory Movement History", icon: <History className="w-4 h-4" />, badge: movements.length },
            { id: "barcode", label: "Barcode Label Tag", icon: <BarcodeIcon className="w-4 h-4" /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* TAB 1: Inventory Movement History Timeline */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Audit Log Timeline
              </h4>
              <span className="text-xs text-slate-400">
                Sorted by most recent
              </span>
            </div>

            {movements.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200">
                <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No stock movements recorded yet
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Adjustments, transfers, or sales will generate logged entries here.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {movements.map((mov) => {
                  const mBadge = movementBadges[mov.type as MovementType] || movementBadges.ADJUSTMENT;
                  const Icon = mBadge.icon;
                  const isPositive = mov.quantityChange > 0;

                  return (
                    <div key={mov._id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 flex items-center justify-center text-indigo-600">
                        <Icon className="w-2.5 h-2.5" />
                      </div>

                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={mBadge.variant} size="sm">
                            {mBadge.label}
                          </Badge>

                          {/* Delta Qty Pill */}
                          <span
                            className={`font-mono font-extrabold text-xs px-2 py-0.5 rounded-full ${
                              isPositive
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            }`}
                          >
                            {isPositive ? `+${mov.quantityChange}` : mov.quantityChange} units
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {mov.reason}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                          <div className="flex items-center gap-1 font-medium">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>{mov.performedBy}</span>
                          </div>

                          <div className="flex items-center gap-1 font-mono text-[10px]">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(mov.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Quantity Before vs After */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                          <span>Qty Before: <strong>{mov.previousQuantity}</strong></span>
                          <span>➜</span>
                          <span>Qty After: <strong className="text-slate-900 dark:text-slate-100">{mov.newQuantity}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Barcode Render Tab */}
        {activeTab === "barcode" && (
          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                ShelfSense Logistics Barcode
              </span>
              <h5 className="text-xs font-bold text-slate-900 mb-2">{item.product}</h5>
              <Barcode value={item.barcode || item.sku} width={1.8} height={60} />
              <span className="font-mono text-xs font-bold text-indigo-600 mt-2">{item.sku}</span>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
