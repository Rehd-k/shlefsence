"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SlidersHorizontal, AlertCircle } from "lucide-react";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBin: any;
  onSuccess: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  targetBin,
  onSuccess,
}) => {
  const [sku, setSku] = useState(targetBin?.items[0]?.sku || "IP15PM-OLED-BLK");
  const [quantityChange, setQuantityChange] = useState<number>(0);
  const [reason, setReason] = useState("Found Stock / Inventory Recount");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBin || quantityChange === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/warehouses/operations/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          binCode: targetBin.binCode,
          sku,
          quantityChange,
          reason,
          performedBy: "Warehouse Manager",
        }),
      });

      const json = await res.json();
      if (json.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Adjustment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Direct Stock Adjustment: Bin ${targetBin?.binCode || ""}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold block mb-1">
            Audit Logged Transaction
          </span>
          <p className="text-slate-600 dark:text-slate-300">
            This adjustment will update bin stock and create a permanent audit entry in <strong>InventoryMovement</strong>.
          </p>
        </div>

        <Input label="Target SKU Code" value={sku} onChange={(e) => setSku(e.target.value)} required />

        <Input
          label="Quantity Change (+ or -)"
          type="number"
          value={quantityChange}
          onChange={(e) => setQuantityChange(Number(e.target.value))}
          placeholder="e.g. +5 or -2"
          required
        />

        <Select
          label="Adjustment Reason Code"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={[
            { label: "Found Stock / Recount", value: "Found Stock / Recount" },
            { label: "Damaged in Handling", value: "Damaged in Handling" },
            { label: "Physical Miscount", value: "Physical Miscount" },
            { label: "Quarantine / Inspection", value: "Quarantine / Inspection" },
          ]}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={submitting || quantityChange === 0}>
            {submitting ? "Processing..." : "Commit Stock Adjustment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
