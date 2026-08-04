"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ArrowLeftRight, Building2, Layers } from "lucide-react";

interface TransferStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferCompleted: (transfer: any) => void;
}

export const TransferStockModal: React.FC<TransferStockModalProps> = ({
  isOpen,
  onClose,
  onTransferCompleted,
}) => {
  const [sku, setSku] = useState("SCR-IP15PM-OEM");
  const [fromWarehouse, setFromWarehouse] = useState("Main Hub - Lagos");
  const [fromShelf, setFromShelf] = useState("A1-S2-B04");
  const [toWarehouse, setToWarehouse] = useState("Ikeja Shop Counter");
  const [toShelf, setToShelf] = useState("B2-S1-B10");
  const [transferQty, setTransferQty] = useState("15");
  const [reason, setReason] = useState("Retail counter restock");
  const [locationOptions, setLocationOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/warehouses")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const opts = json.data.map((w: any) => ({
            value: w.name,
            label: `${w.name} (${w.type || "Hub"})`,
          }));
          setLocationOptions(opts);
        }
      })
      .catch(() => {});
  }, []);

  const defaultLocations = [
    { value: "Main Hub - Lagos", label: "Main Hub - Lagos" },
    { value: "Ikeja Shop Counter", label: "Ikeja Shop Counter" },
    { value: "Abuja Central Hub", label: "Abuja Central Hub" },
    { value: "Port Harcourt Depot", label: "Port Harcourt Depot" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const transferRecord = {
      id: `tr-${Date.now()}`,
      transferNumber: `TRF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      sku,
      productName: sku,
      fromWarehouse,
      sourceWarehouse: fromWarehouse,
      fromShelf,
      toWarehouse,
      targetWarehouse: toWarehouse,
      toShelf,
      quantity: parseInt(transferQty) || 1,
      reason,
      status: "Completed",
      transferredBy: "Inventory Lead",
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch("/api/warehouses/operations/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transferRecord),
      });
    } catch (err) {
      console.error("Transfer error:", err);
    } finally {
      setLoading(false);
    }

    onTransferCompleted(transferRecord);
    onClose();
  };

  const opts = locationOptions.length > 0 ? locationOptions : defaultLocations;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Product Stock Between Locations"
      description="Relocate inventory units between central hubs, depots, or retail shop counters."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
        <Input
          label="Product Part SKU / Title"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          required
          icon={<Layers className="w-4 h-4" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Source Location (From)"
            value={fromWarehouse}
            onChange={(e) => setFromWarehouse(e.target.value)}
            options={opts}
          />

          <Input
            label="Source Bin Shelf"
            value={fromShelf}
            onChange={(e) => setFromShelf(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Destination Location (To)"
            value={toWarehouse}
            onChange={(e) => setToWarehouse(e.target.value)}
            options={opts}
          />

          <Input
            label="Destination Bin Shelf"
            value={toShelf}
            onChange={(e) => setToShelf(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Quantity to Transfer"
            type="number"
            min="1"
            value={transferQty}
            onChange={(e) => setTransferQty(e.target.value)}
            required
          />

          <Input
            label="Reason / Notes"
            placeholder="e.g. Retail shop counter restock"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            variant="primary"
            icon={<ArrowLeftRight className="w-4 h-4" />}
          >
            Confirm Location Stock Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
};
