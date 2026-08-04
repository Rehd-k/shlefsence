"use client";

import React, { useState } from "react";
import {
  Download,
  Sliders,
  ArrowRightLeft,
  Printer,
  Trash2,
  CheckSquare,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IInventoryItem } from "@/lib/types/inventory";
import { StockAdjustmentModal } from "@/components/inventory/StockAdjustmentModal";
import { MoveInventoryModal } from "@/components/inventory/MoveInventoryModal";
import { PrintBarcodeModal } from "@/components/inventory/PrintBarcodeModal";
import { DeleteConfirmModal } from "@/components/inventory/DeleteConfirmModal";
import Papa from "papaparse";

export interface InventoryBulkActionsProps {
  selectedItems: IInventoryItem[];
  onClearSelection: () => void;
  onStockAdjusted: (adjustmentData: any) => void;
  onInventoryMoved: (moveData: any) => void;
  onItemsDeleted: () => void;
}

export const InventoryBulkActions: React.FC<InventoryBulkActionsProps> = ({
  selectedItems,
  onClearSelection,
  onStockAdjusted,
  onInventoryMoved,
  onItemsDeleted,
}) => {
  const [activeModal, setActiveModal] = useState<
    "ADJUST" | "MOVE" | "PRINT" | "DELETE" | null
  >(null);

  if (selectedItems.length === 0) return null;

  // Handle Export CSV action using PapaParse
  const handleExportCSV = () => {
    const csvData = selectedItems.map((item) => ({
      SKU: item.sku,
      Product: item.product,
      Brand: item.brand,
      Model: item.phoneModel,
      Category: item.category,
      Quality: item.quality,
      Supplier: item.supplier,
      Warehouse: item.warehouse,
      Shelf: item.shelf,
      Quantity: item.quantity,
      Reserved: item.reserved,
      Available: item.available,
      Cost_USD: item.cost,
      SellingPrice_USD: item.sellingPrice,
      Status: item.status,
      Barcode: item.barcode,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `ShelfSense_Inventory_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Floating Sticky Bulk Actions Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900 text-white border border-slate-700 rounded-2xl p-2.5 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
        {/* Selection Count Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl text-xs font-semibold">
          <CheckSquare className="w-4 h-4 text-indigo-400" />
          <span>
            <strong className="text-white">{selectedItems.length}</strong> selected
          </span>
          <button
            onClick={onClearSelection}
            className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition cursor-pointer ml-1"
            title="Deselect all items"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-800" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Export */}
          <Button
            variant="secondary"
            size="sm"
            icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
            onClick={handleExportCSV}
          >
            Export
          </Button>

          {/* Adjust Stock */}
          <Button
            variant="secondary"
            size="sm"
            icon={<Sliders className="w-3.5 h-3.5 text-amber-400" />}
            onClick={() => setActiveModal("ADJUST")}
          >
            Adjust Stock
          </Button>

          {/* Move Inventory */}
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />}
            onClick={() => setActiveModal("MOVE")}
          >
            Move Inventory
          </Button>

          {/* Print Barcode */}
          <Button
            variant="secondary"
            size="sm"
            icon={<Printer className="w-3.5 h-3.5 text-purple-400" />}
            onClick={() => setActiveModal("PRINT")}
          >
            Print Barcode
          </Button>

          {/* Delete */}
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setActiveModal("DELETE")}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Action Modals */}
      <StockAdjustmentModal
        isOpen={activeModal === "ADJUST"}
        onClose={() => setActiveModal(null)}
        selectedItems={selectedItems}
        onConfirmAdjustment={onStockAdjusted}
      />

      <MoveInventoryModal
        isOpen={activeModal === "MOVE"}
        onClose={() => setActiveModal(null)}
        selectedItems={selectedItems}
        onConfirmMove={onInventoryMoved}
      />

      <PrintBarcodeModal
        isOpen={activeModal === "PRINT"}
        onClose={() => setActiveModal(null)}
        selectedItems={selectedItems}
      />

      <DeleteConfirmModal
        isOpen={activeModal === "DELETE"}
        onClose={() => setActiveModal(null)}
        selectedItems={selectedItems}
        onConfirmDelete={onItemsDeleted}
      />
    </>
  );
};
