"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Package, Truck, CheckCircle2, QrCode, Printer } from "lucide-react";

interface PackingOrder {
  id: string;
  packNumber: string;
  pickTicketId: string;
  packageType: "Carton Box Small" | "Carton Box Medium" | "Pallet" | "Bubble Mailer";
  weightKg: number;
  trackingNumber: string;
  status: "Packing" | "Ready for Dispatch" | "Shipped";
  packedBy: string;
}

interface PackingTabProps {
  orders: PackingOrder[];
  onRefresh: () => void;
}

export const PackingTab: React.FC<PackingTabProps> = ({ orders, onRefresh }) => {
  const [selectedPack, setSelectedPack] = useState<PackingOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [packageType, setPackageType] = useState<any>("Carton Box Medium");
  const [weightKg, setWeightKg] = useState(1.5);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenPackModal = (pack: PackingOrder) => {
    setSelectedPack(pack);
    setPackageType(pack.packageType);
    setWeightKg(pack.weightKg);
    setIsModalOpen(true);
  };

  const handleConfirmPack = async () => {
    if (!selectedPack) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/warehouses/operations/packing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPack.id,
          status: "Ready for Dispatch",
          packageType,
          weightKg,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error("Packing update error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-500" /> Outbound Packing & Dispatch Station
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verify picked items, assign shipping cartons/mailers, print packing slips, and stage orders for courier pickup.
          </p>
        </div>
      </div>

      {/* Packing Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((pack) => (
          <div
            key={pack.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-purple-600 dark:text-purple-400">
                    {pack.packNumber}
                  </span>
                  <Badge
                    variant={pack.status === "Ready for Dispatch" ? "success" : pack.status === "Shipped" ? "indigo" : "warning"}
                    size="sm"
                  >
                    {pack.status}
                  </Badge>
                </div>
                <span className="text-xs text-slate-400 font-mono">Ref: {pack.pickTicketId}</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Package Format:</span>
                  <strong className="text-slate-900 dark:text-white">{pack.packageType}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Scale Weight:</span>
                  <strong className="text-slate-900 dark:text-white">{pack.weightKg} kg</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tracking Code:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{pack.trackingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Station Inspector:</span>
                  <span className="text-slate-700 dark:text-slate-300">{pack.packedBy}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" fullWidth icon={<Printer className="w-3.5 h-3.5" />}>
                Print Label
              </Button>
              {pack.status === "Packing" && (
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={() => handleOpenPackModal(pack)}
                >
                  Complete Package
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pack Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Finalize Package: ${selectedPack?.packNumber || ""}`}
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Container Packaging Type"
            value={packageType}
            onChange={(e) => setPackageType(e.target.value)}
            options={[
              { label: "Carton Box Small", value: "Carton Box Small" },
              { label: "Carton Box Medium", value: "Carton Box Medium" },
              { label: "Pallet", value: "Pallet" },
              { label: "Bubble Mailer", value: "Bubble Mailer" },
            ]}
          />

          <Input
            label="Gross Weight (Kg)"
            type="number"
            step="0.1"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
          />

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
            <span className="text-slate-400 block">Generated Tracking Code:</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm block">
              {selectedPack?.trackingNumber}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmPack} disabled={submitting}>
              {submitting ? "Updating..." : "Confirm & Stage for Dispatch"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
