"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  Upload,
  Download,
  Printer,
  Zap,
  LayoutGrid,
  Table as TableIcon,
  Search,
} from "lucide-react";
import { clsx } from "clsx";

interface ProductHeaderActionsProps {
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  onNewProduct: () => void;
  onAddCategory?: () => void;
  onImportProducts: () => void;
  onExportProducts: () => void;
  onPrintBarcode: () => void;
  onBulkUpdate: () => void;
  selectedCount: number;
}

export const ProductHeaderActions: React.FC<ProductHeaderActionsProps> = ({
  viewMode,
  onViewModeChange,
  onNewProduct,
  onAddCategory,
  onImportProducts,
  onExportProducts,
  onPrintBarcode,
  onBulkUpdate,
  selectedCount,
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
      {/* Top Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          onClick={onNewProduct}
        >
          New Product
        </Button>

        {onAddCategory && (
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5 text-indigo-600" />}
            onClick={onAddCategory}
          >
            Add Category
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          icon={<Upload className="w-3.5 h-3.5 text-indigo-500" />}
          onClick={onImportProducts}
        >
          Import Products
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={<Download className="w-3.5 h-3.5" />}
          onClick={onExportProducts}
        >
          Export
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={<Printer className="w-3.5 h-3.5 text-purple-500" />}
          onClick={onPrintBarcode}
        >
          Print Barcode {selectedCount > 0 && `(${selectedCount})`}
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={<Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400/20" />}
          onClick={onBulkUpdate}
        >
          Bulk Update {selectedCount > 0 && `(${selectedCount})`}
        </Button>
      </div>

      {/* View Switcher (Product Cards vs Enterprise Data Table) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 self-end lg:self-auto">
        <button
          onClick={() => onViewModeChange("grid")}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer",
            viewMode === "grid"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          )}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Product Cards</span>
        </button>

        <button
          onClick={() => onViewModeChange("table")}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer",
            viewMode === "table"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          )}
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span>Data Table</span>
        </button>
      </div>
    </div>
  );
};
