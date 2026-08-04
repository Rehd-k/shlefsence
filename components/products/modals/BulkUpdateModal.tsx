"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Zap, DollarSign, Warehouse, Layers } from "lucide-react";
import { IProduct } from "@/lib/types/product";

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: IProduct[];
  onBulkUpdateCompleted: (action: string, value: any) => void;
}

export const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  onBulkUpdateCompleted,
}) => {
  const [updateType, setUpdateType] = useState<"price" | "warehouse" | "supplier">("price");
  const [priceAdjustmentPercent, setPriceAdjustmentPercent] = useState("5");
  const [targetWarehouse, setTargetWarehouse] = useState("West Coast Depot - LA");
  const [targetSupplier, setSupplier] = useState("Foxconn Electronics Shenzhen");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateType === "price") {
      onBulkUpdateCompleted("price", parseFloat(priceAdjustmentPercent) || 0);
    } else if (updateType === "warehouse") {
      onBulkUpdateCompleted("warehouse", targetWarehouse);
    } else {
      onBulkUpdateCompleted("supplier", targetSupplier);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Update Selected Products"
      description={`Apply batch edits to ${selectedProducts.length || "all"} selected phone spare part items.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <Select
          label="Bulk Operation Type"
          value={updateType}
          onChange={(e) => setUpdateType(e.target.value as any)}
          options={[
            { value: "price", label: "Adjust Wholesale & Selling Prices (%)" },
            { value: "warehouse", label: "Reassign Primary Warehouse Facility" },
            { value: "supplier", label: "Reassign Supplier Vendor" },
          ]}
        />

        {updateType === "price" && (
          <Input
            label="Price Change Percentage (%)"
            type="number"
            placeholder="e.g. 5 for +5% or -10 for discount"
            value={priceAdjustmentPercent}
            onChange={(e) => setPriceAdjustmentPercent(e.target.value)}
            required
            icon={<DollarSign className="w-4 h-4" />}
          />
        )}

        {updateType === "warehouse" && (
          <Select
            label="Target Warehouse Location"
            value={targetWarehouse}
            onChange={(e) => setTargetWarehouse(e.target.value)}
            options={[
              { value: "Main Hub - New York", label: "Main Hub - NY" },
              { value: "West Coast Depot - LA", label: "West Coast Depot - LA" },
              { value: "Central Hub - Texas", label: "Central Hub - TX" },
            ]}
          />
        )}

        {updateType === "supplier" && (
          <Select
            label="Primary Supplier Vendor"
            value={targetSupplier}
            onChange={(e) => setSupplier(e.target.value)}
            options={[
              { value: "Foxconn Electronics Shenzhen", label: "Foxconn Electronics" },
              { value: "Sunsky Technology Wholesale", label: "Sunsky Tech" },
              { value: "DJI & Parts Global Corp", label: "DJI & Parts" },
            ]}
          />
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={<Zap className="w-4 h-4 text-amber-400" />}>
            Apply Bulk Update to {selectedProducts.length || "Items"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
