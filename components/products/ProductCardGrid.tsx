"use client";

import React from "react";
import { IProduct } from "@/lib/types/product";
import { Badge } from "@/components/ui/Badge";
import {
  Tag,
  Barcode,
  Building2,
  DollarSign,
  Shield,
  Layers,
  Printer,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { formatCurrency } from "@/lib/utils/formatCurrency";

interface ProductCardGridProps {
  products: IProduct[];
  selectedIds: string[];
  onSelectProduct: (id: string, isSelected: boolean) => void;
  onViewDetails: (product: IProduct) => void;
  onPrintBarcode: (product: IProduct) => void;
}

export const ProductCardGrid: React.FC<ProductCardGridProps> = ({
  products,
  selectedIds,
  onSelectProduct,
  onViewDetails,
  onPrintBarcode,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((prod) => {
        const isSelected = selectedIds.includes(prod.id);
        return (
          <div
            key={prod.id}
            className={clsx(
              "group relative bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden",
              isSelected
                ? "border-indigo-600 ring-2 ring-indigo-500/20 dark:border-indigo-500"
                : "border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40"
            )}
          >
            {/* Top Selection Checkbox & Quality Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelectProduct(prod.id, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <Badge variant="purple" size="sm">
                  {prod.quality.replace("_", " ")}
                </Badge>
              </div>

              <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                {prod.brand}
              </span>
            </div>

            {/* Product Image & Key Header Info */}
            <div
              className="flex gap-3 cursor-pointer"
              onClick={() => onViewDetails(prod)}
            >
              <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {prod.name}
                </h3>
                <p className="text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                  {prod.sku}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  Category: {prod.category}
                </p>
              </div>
            </div>

            {/* Compatible Models Tags */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {prod.compatibleModels.map((model) => (
                <span
                  key={model}
                  className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded whitespace-nowrap"
                >
                  {model}
                </span>
              ))}
            </div>

            {/* Price Matrix Grid (Purchase, Wholesale, Selling) */}
            <div className="mt-3 grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl text-[10px] border border-slate-200/60 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block font-medium">Cost</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                  {formatCurrency(prod.purchasePrice)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Wholesale</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                  {formatCurrency(prod.wholesalePrice)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Retail</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(prod.sellingPrice)}
                </span>
              </div>
            </div>

            {/* Stock Bar & Bin Info */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500 dark:text-slate-400">
                  Bin: <strong className="font-mono text-slate-800 dark:text-slate-200">{prod.shelf}</strong> ({prod.warehouse.split("-")[0]})
                </span>
                <span
                  className={clsx(
                    "font-bold font-mono px-1.5 py-0.2 rounded text-[10px]",
                    prod.stock.status === "OUT_OF_STOCK"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                      : prod.stock.status === "LOW_STOCK"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  )}
                >
                  {prod.stock.available} Available
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-300",
                    prod.stock.status === "OUT_OF_STOCK"
                      ? "w-0 bg-rose-500"
                      : prod.stock.status === "LOW_STOCK"
                      ? "w-1/4 bg-amber-500"
                      : "w-3/4 bg-emerald-500"
                  )}
                />
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-slate-400" /> {prod.warranty}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPrintBarcode(prod)}
                  className="p-1 rounded text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 transition cursor-pointer"
                  title="Print Barcode Label"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onViewDetails(prod)}
                  className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
