"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  ShoppingCart,
  Plus,
  ShoppingBag,
  ArrowLeftRight,
  PackageCheck,
  Zap,
} from "lucide-react";

interface QuickActionToolbarProps {
  onCreateSale: () => void;
  onAddProduct: () => void;
  onCreatePO: () => void;
  onTransferStock: () => void;
  onReceiveShipment: () => void;
}

export const QuickActionToolbar: React.FC<QuickActionToolbarProps> = ({
  onCreateSale,
  onAddProduct,
  onCreatePO,
  onTransferStock,
  onReceiveShipment,
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Dynamic Stripe x Linear subtle glow background */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-bl from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-emerald-500/15 via-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" /> Quick Operations Control
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Accelerated shortcuts for sales, procurement, inventory movement, and warehouse receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Create Sale */}
          <button
            onClick={onCreateSale}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Shortcut: Shift+S"
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
            <span>Create Sale</span>
            <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono font-medium">
              ⇧S
            </kbd>
          </button>

          {/* Add Product */}
          <button
            onClick={onAddProduct}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-100 text-xs font-bold transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Shortcut: Shift+A"
          >
            <Plus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            <span>Add Product</span>
            <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-slate-700/80 text-slate-300 rounded font-mono font-medium">
              ⇧A
            </kbd>
          </button>

          {/* Create PO */}
          <button
            onClick={onCreatePO}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-100 text-xs font-bold transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Shortcut: Shift+P"
          >
            <ShoppingBag className="w-4 h-4 text-purple-400 stroke-[2.2]" />
            <span>Create PO</span>
            <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-slate-700/80 text-slate-300 rounded font-mono font-medium">
              ⇧P
            </kbd>
          </button>

          {/* Transfer Stock */}
          <button
            onClick={onTransferStock}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-100 text-xs font-bold transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Shortcut: Shift+T"
          >
            <ArrowLeftRight className="w-4 h-4 text-cyan-400 stroke-[2.2]" />
            <span>Transfer Stock</span>
            <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-slate-700/80 text-slate-300 rounded font-mono font-medium">
              ⇧T
            </kbd>
          </button>

          {/* Receive Shipment */}
          <button
            onClick={onReceiveShipment}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-100 text-xs font-bold transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Shortcut: Shift+R"
          >
            <PackageCheck className="w-4 h-4 text-amber-400 stroke-[2.2]" />
            <span>Receive Shipment</span>
            <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-slate-700/80 text-slate-300 rounded font-mono font-medium">
              ⇧R
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
