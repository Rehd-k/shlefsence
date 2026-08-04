"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { IInventoryItem } from "@/lib/types/inventory";
import { Sliders, Plus, Minus } from "lucide-react";

export interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: IInventoryItem[];
  onConfirmAdjustment: (adjustmentData: {
    adjustmentType: "ADD" | "SUBTRACT" | "SET";
    quantity: number;
    reason: string;
    operatorNotes?: string;
  }) => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  onConfirmAdjustment,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<"ADD" | "SUBTRACT" | "SET">("ADD");
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<string>("Audit Stock Count Adjustment");
  const [operatorNotes, setOperatorNotes] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmAdjustment({
      adjustmentType,
      quantity,
      reason,
      operatorNotes,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock Quantity (${selectedItems.length} items)`}
      description="Record physical count adjustments, damaged goods write-offs, or stock intake corrections."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item preview list */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 max-h-32 overflow-y-auto space-y-1 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300">Selected Products:</span>
          {selectedItems.map((item) => (
            <div key={item._id} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.sku}</span>
              <span className="truncate max-w-[200px]">{item.product}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Current Qty: {item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Action Type Tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setAdjustmentType("ADD")}
            className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition cursor-pointer ${
              adjustmentType === "ADD"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Add Stock (+Qty)
          </button>
          <button
            type="button"
            onClick={() => setAdjustmentType("SUBTRACT")}
            className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition cursor-pointer ${
              adjustmentType === "SUBTRACT"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
            }`}
          >
            <Minus className="w-3.5 h-3.5" /> Deduct Stock (-Qty)
          </button>
          <button
            type="button"
            onClick={() => setAdjustmentType("SET")}
            className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition cursor-pointer ${
              adjustmentType === "SET"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Set Exact Qty
          </button>
        </div>

        {/* Quantity Field */}
        <Input
          label={adjustmentType === "SET" ? "Exact Set Quantity" : "Adjustment Quantity Delta"}
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          required
        />

        {/* Reason Code Dropdown */}
        <Select
          label="Adjustment Reason Code"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={[
            { value: "Audit Stock Count Adjustment", label: "Physical Audit Stock Count" },
            { value: "Damaged / Defective Stock Write-off", label: "Damaged / Defective Stock Write-off" },
            { value: "Unrecorded Purchase Intake", label: "Unrecorded Goods Intake" },
            { value: "Customer Return Intake", label: "Customer Return Intake" },
            { value: "Correction of Data Entry Error", label: "Correction of Data Entry Error" },
          ]}
        />

        {/* Operator Notes */}
        <Input
          label="Operator Audit Notes (Optional)"
          placeholder="e.g. Bin A1 verified during physical inventory cycle count"
          value={operatorNotes}
          onChange={(e) => setOperatorNotes(e.target.value)}
        />

        {/* Modal Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Apply Stock Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
