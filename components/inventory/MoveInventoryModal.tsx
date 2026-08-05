"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { IInventoryItem } from "@/lib/types/inventory";
import { ArrowRight } from "lucide-react";

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
  const [targetWarehouse, setTargetWarehouse] = useState<string>("");
  const [warehousesList, setWarehousesList] = useState<{ value: string; label: string }[]>([]);
  const [targetShelf, setTargetShelf] = useState<string>("B2-S1-B05");
  const [reason, setReason] = useState<string>("Inter-warehouse Stock Transfer");

  useEffect(() => {
    fetch("/api/warehouses")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const opts = json.data.map((w: any) => ({ value: w.name, label: w.name }));
          setWarehousesList(opts);
          if (opts.length > 0) {
            setTargetWarehouse(opts[0].value);
          }
        }
      })
      .catch(() => {});
  }, [isOpen]);

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
      title="Relocate Stock or Transfer Branch"
      description="Create a stock movement audit trail. This updates shelf balances instantly."
      maxWidth="md"
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
          options={warehousesList}
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
            { value: "Inter-warehouse Stock Transfer", label: "Inter-branch Transfer Route" },
            { value: "Damaged Stock Relocation", label: "Relocation to Damaged Stock Zone" },
            { value: "Putaway Correction", label: "Corrective Zone Re-binning" },
            { value: "Temporary Display Count", label: "Counter Showroom Display" },
          ]}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Confirm Relocation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
