"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Printer, Barcode, Check } from "lucide-react";
import { IProduct } from "@/lib/types/product";

interface PrintBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: IProduct[];
  onPrintCompleted: (labelCount: number) => void;
}

export const PrintBarcodeModal: React.FC<PrintBarcodeModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  onPrintCompleted,
}) => {
  const [copies, setCopies] = useState("2");
  const [labelSize, setLabelSize] = useState("50x30");

  const totalLabels = (selectedProducts.length || 1) * (parseInt(copies) || 1);

  const handlePrint = () => {
    onPrintCompleted(totalLabels);
    onClose();
  };

  const sampleProduct = selectedProducts[0] || {
    sku: "SCR-IP16PM-OEM",
    name: "iPhone 16 Pro Max OLED Assembly",
    barcode: "8901234567890",
    shelf: "A1-S2-B04",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Print Barcode Labels"
      description="Generate high-density thermal barcode sticker labels for warehouse shelf bins and product packaging."
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Barcode Label Preview Box */}
        <div className="p-4 rounded-2xl bg-white text-slate-900 border-2 border-slate-900 shadow-md max-w-xs mx-auto text-center space-y-1 font-mono">
          <p className="text-[10px] font-bold tracking-widest uppercase">ShelfSense ERP Label</p>
          <p className="text-xs font-black truncate">{sampleProduct.name}</p>
          <p className="text-[11px] font-bold text-indigo-600">{sampleProduct.sku}</p>

          {/* Barcode Mock Visual */}
          <div className="py-2 flex flex-col items-center justify-center">
            <div className="h-10 w-48 bg-slate-900 flex items-center justify-around px-1">
              <span className="w-1 h-full bg-white" />
              <span className="w-2 h-full bg-white" />
              <span className="w-0.5 h-full bg-white" />
              <span className="w-1.5 h-full bg-white" />
              <span className="w-0.5 h-full bg-white" />
              <span className="w-2 h-full bg-white" />
              <span className="w-1 h-full bg-white" />
              <span className="w-0.5 h-full bg-white" />
              <span className="w-1.5 h-full bg-white" />
              <span className="w-2 h-full bg-white" />
            </div>
            <span className="text-[10px] tracking-widest mt-1 font-semibold">{sampleProduct.barcode}</span>
          </div>

          <div className="flex items-center justify-between text-[9px] border-t border-slate-200 pt-1 font-sans">
            <span>Bin: <strong>{sampleProduct.shelf}</strong></span>
            <span>Grade: <strong>OEM ORIG</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Copies Per SKU"
            type="number"
            min="1"
            value={copies}
            onChange={(e) => setCopies(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Label Size Format
            </label>
            <select
              value={labelSize}
              onChange={(e) => setLabelSize(e.target.value)}
              className="rounded-lg border bg-white px-3 py-2 text-sm border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            >
              <option value="50x30">50mm x 30mm (Standard Thermal Sticker)</option>
              <option value="40x20">40mm x 20mm (Small Flex Cable Sticker)</option>
              <option value="100x50">100mm x 50mm (Master Box Label)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400">
            Selected SKUs: <strong>{selectedProducts.length || 1}</strong> | Total Labels: <strong className="text-indigo-600 dark:text-indigo-400">{totalLabels}</strong>
          </span>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="primary" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
              Send to Thermal Printer
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
