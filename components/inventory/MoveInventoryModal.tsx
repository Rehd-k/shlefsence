"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { IInventoryItem } from "@/lib/types/inventory";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { WAREHOUSE_OPTIONS } from "@/components/layout/AppLayout";

export interface MoveInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: IInventoryItem[];
  onConfirmMove: (moveData: {
    targetWarehouse: string;
    targetShelf: string;
    reason: string;
  }) => void;
}

export const MoveInventoryModal: React.FC<MoveInventoryModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  onConfirmMove,
}) => {
  const [targetWarehouse, setTargetWarehouse] = useState<string>("West Coast Depot - LA");
  const [targetShelf, setTargetShelf] = useState<string>("B2-S1-B05");
  const [reason, setReason] = useState<string>("Inter-warehouse Stock Transfer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmMove({
      targetWarehouse,
      targetShelf,
      reason,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Move Inventory (${selectedItems.length} items)`}
      description="Transfer stock between warehouse hubs or relocate shelf & bin positions."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Origin Summary */}
        <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-lg dark:bg-indigo-950/40 dark:border-indigo-800 text-xs space-y-1">
          <span className="font-bold text-indigo-900 dark:text-indigo-200">Origin Items:</span>
          {selectedItems.map((item) => (
            <div key={item._id} className="flex items-center justify-between text-indigo-800 dark:text-indigo-300">
              <span className="font-mono font-bold">{item.sku}</span>
              <span className="truncate max-w-[180px]">{item.product}</span>
              <span>{item.warehouse} ({item.shelf})</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center py-1">
          <ArrowRight className="w-5 h-5 text-slate-400" />
        </div>

        {/* Target Destination */}
        <Select
          label="Destination Warehouse Hub"
          value={targetWarehouse}
          onChange={(e) => setTargetWarehouse(e.target.value)}
          options={WAREHOUSE_OPTIONS.filter((w) => w !== "All Warehouses").map((w) => ({
            value: w,
            label: w,
          }))}
        />

        <Input
          label="Target Shelf & Bin Location"
          placeholder="e.g. A2-S4-B09"
          value={targetShelf}
          onChange={(e) => setTargetShelf(e.target.value)}
          required
        />

        <Select
          label="Transfer Reason / Reference"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={[
            { value: "Inter-warehouse Stock Transfer", label: "Inter-warehouse Stock Transfer" },
            { value: "Regional Rebalance Fulfillment", label: "Regional Rebalance Fulfillment" },
            { value: "Warehouse Bin Relocation", label: "Warehouse Bin Relocation" },
            { value: "Overstock Redistribution", label: "Overstock Redistribution" },
          ]}
        />

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Confirm Inventory Move
          </Button>
        </div>
      </form>
    </Modal>
  );
};
