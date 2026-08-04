"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PackageCheck, Truck, CheckCircle2, ShieldAlert } from "lucide-react";

interface ReceiveShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShipmentReceived: (receipt: any) => void;
}

export const ReceiveShipmentModal: React.FC<ReceiveShipmentModalProps> = ({
  isOpen,
  onClose,
  onShipmentReceived,
}) => {
  const [poNumber, setPoNumber] = useState("PO-2026-8810");
  const [supplier, setSupplier] = useState("Foxconn Electronics Shenzhen");
  const [receivedQty, setReceivedQty] = useState("150");
  const [damagedQty, setDamagedQty] = useState("0");
  const [targetBin, setTargetBin] = useState("A1-S1-B01");
  const [notes, setNotes] = useState("Inspected by Receiving QC, all items Grade A OEM");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const receipt = {
      id: `rcpt-${Date.now()}`,
      poNumber,
      supplier,
      receivedQty: parseInt(receivedQty) || 0,
      damagedQty: parseInt(damagedQty) || 0,
      targetBin,
      notes,
      receivedAt: new Date().toISOString(),
    };

    onShipmentReceived(receipt);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receive Incoming PO Shipment"
      description="Inspect incoming shipment, log QC defects, and place stock into bin locations."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="PO Reference Number"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
            required
            icon={<Truck className="w-4 h-4" />}
          />

          <Select
            label="Supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            options={[
              { value: "Foxconn Electronics Shenzhen", label: "Foxconn Electronics" },
              { value: "Sunsky Technology Wholesale", label: "Sunsky Tech" },
              { value: "DJI & Parts Global Corp", label: "DJI & Parts" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Received Units Qty"
            type="number"
            value={receivedQty}
            onChange={(e) => setReceivedQty(e.target.value)}
            required
          />

          <Input
            label="Damaged / Rejected Qty"
            type="number"
            value={damagedQty}
            onChange={(e) => setDamagedQty(e.target.value)}
          />

          <Input
            label="Putaway Target Bin"
            value={targetBin}
            onChange={(e) => setTargetBin(e.target.value)}
            required
          />
        </div>

        <Input
          label="QC Inspection Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Verified flex cables & original seals intact"
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={<PackageCheck className="w-4 h-4" />}>
            Log & Receive Shipment into Bin
          </Button>
        </div>
      </form>
    </Modal>
  );
};
