"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ArrowRightLeft, Building2, CheckCircle2, Plus, MapPin } from "lucide-react";

interface TransferItem {
  sku: string;
  name: string;
  quantity: number;
  sourceBinCode: string;
  targetBinCode?: string;
}

interface TransferDoc {
  id: string;
  transferNumber: string;
  sourceWarehouseName: string;
  targetWarehouseName: string;
  status: "Requested" | "In-Transit" | "Completed" | "Cancelled";
  requestedBy: string;
  items: TransferItem[];
}

interface TransfersTabProps {
  transfers: TransferDoc[];
  warehouses: { id: string; name: string }[];
  onRefresh: () => void;
}

export const TransfersTab: React.FC<TransfersTabProps> = ({ transfers, warehouses, onRefresh }) => {
  const [isNewTransferModalOpen, setIsNewTransferModalOpen] = useState(false);
  const [sourceWarehouse, setSourceWarehouse] = useState(warehouses[0]?.name || "Main Hub - New York");
  const [targetWarehouse, setTargetWarehouse] = useState(warehouses[1]?.name || "Branch Store - Brooklyn");
  const [transferSku, setTransferSku] = useState("IP15PM-OLED-BLK");
  const [transferQty, setTransferQty] = useState(10);
  const [sourceBin, setSourceBin] = useState("ZA-R01-S2-B01");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateTransfer = async () => {
    setSubmitting(true);
    try {
      const srcWh = warehouses.find((w) => w.name === sourceWarehouse) || warehouses[0];
      const tgtWh = warehouses.find((w) => w.name === targetWarehouse) || warehouses[1];

      const res = await fetch("/api/warehouses/operations/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferNumber: `TRF-2026-${Math.floor(100 + Math.random() * 900)}`,
          sourceWarehouseId: srcWh.id,
          sourceWarehouseName: srcWh.name,
          targetWarehouseId: tgtWh.id,
          targetWarehouseName: tgtWh.name,
          status: "In-Transit",
          requestedBy: "Logistics Manager",
          items: [
            {
              sku: transferSku,
              name: transferSku === "IP15PM-OLED-BLK" ? "iPhone 15 Pro Max OLED Assembly" : "Galaxy S24 Ultra Battery",
              quantity: transferQty,
              sourceBinCode: sourceBin,
              targetBinCode: "BR-ZA-R01-S1-B01",
            },
          ],
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsNewTransferModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error("Create transfer error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (transfer: TransferDoc, status: "In-Transit" | "Completed") => {
    try {
      const res = await fetch("/api/warehouses/operations/transfers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: transfer.id,
          status,
          performedBy: "Transfer Receiver",
        }),
      });

      const json = await res.json();
      if (json.success) {
        onRefresh();
      }
    } catch (err) {
      console.error("Update transfer error:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Inter-Warehouse & Branch Stock Transfers
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dispatch inventory between main fulfillment hubs, regional depots, and retail repair branch stores.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsNewTransferModalOpen(true)}
        >
          Create Stock Transfer
        </Button>
      </div>

      {/* Transfers Cards */}
      <div className="space-y-4">
        {transfers.map((trf) => (
          <div
            key={trf.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                    {trf.transferNumber}
                  </span>
                  <Badge
                    variant={trf.status === "Completed" ? "success" : trf.status === "In-Transit" ? "indigo" : "warning"}
                    size="sm"
                  >
                    {trf.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{trf.sourceWarehouseName}</span>
                  <ArrowRightLeft className="w-3 h-3 text-indigo-500" />
                  <span>{trf.targetWarehouseName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {trf.status === "Requested" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(trf, "In-Transit")}
                  >
                    Mark In-Transit
                  </Button>
                )}
                {trf.status === "In-Transit" && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    onClick={() => handleUpdateStatus(trf, "Completed")}
                  >
                    Receive at Target Branch
                  </Button>
                )}
              </div>
            </div>

            {/* Transfer Items */}
            <div className="border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {trf.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{item.sku}</span>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>Source Bin: <strong>{item.sourceBinCode}</strong></span>
                      {item.targetBinCode && <span>Target Bin: <strong>{item.targetBinCode}</strong></span>}
                    </div>
                  </div>
                  <Badge variant="indigo" size="sm">
                    {item.quantity} Units
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}

        {transfers.length === 0 && (
          <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center text-slate-400">
            <ArrowRightLeft className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No transfer manifests active.</p>
          </div>
        )}
      </div>

      {/* New Transfer Modal */}
      <Modal
        isOpen={isNewTransferModalOpen}
        onClose={() => setIsNewTransferModalOpen(false)}
        title="Create Inter-Warehouse Stock Transfer"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Origin Source Facility"
            value={sourceWarehouse}
            onChange={(e) => setSourceWarehouse(e.target.value)}
            options={warehouses.map((w) => ({ label: w.name, value: w.name }))}
          />

          <Select
            label="Destination Target Branch/Depot"
            value={targetWarehouse}
            onChange={(e) => setTargetWarehouse(e.target.value)}
            options={warehouses.map((w) => ({ label: w.name, value: w.name }))}
          />

          <Input
            label="SKU Code"
            value={transferSku}
            onChange={(e) => setTransferSku(e.target.value)}
          />

          <Input
            label="Origin Source Bin"
            value={sourceBin}
            onChange={(e) => setSourceBin(e.target.value)}
          />

          <Input
            label="Transfer Quantity"
            type="number"
            value={transferQty}
            onChange={(e) => setTransferQty(Number(e.target.value))}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsNewTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateTransfer} disabled={submitting}>
              {submitting ? "Creating..." : "Create Transfer Order"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
