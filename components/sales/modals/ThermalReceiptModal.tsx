"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IReceipt } from "@/lib/types/sales";
import { Printer, CheckCircle2, Store, Barcode } from "lucide-react";
import { useSettings } from "@/lib/context/SettingsContext";

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: IReceipt | null;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
}) => {
  const { settings, formatPrice } = useSettings();

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thermal Receipt Preview (80mm)" maxWidth="md">
      <div className="space-y-4">
        {/* Visual 80mm Thermal Receipt Container */}
        <div className="bg-amber-50/40 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 rounded-2xl max-w-sm mx-auto shadow-md font-mono text-xs text-slate-800 dark:text-slate-200 space-y-4 select-none">
          {/* Header Store Branding */}
          <div className="text-center border-b border-dashed border-slate-400 pb-3 space-y-1">
            <div className="flex justify-center mb-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                SS
              </div>
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-widest uppercase">
              {settings.businessName || receipt.storeName}
            </h3>
            <p className="text-[10px] text-slate-500">{settings.businessAddress || receipt.storeAddress}</p>
            <p className="text-[10px] text-slate-500">Tel: {settings.businessPhone || "+234 (1) 555-0192"} • Tax ID: 13-904128</p>
          </div>

          {/* Receipt Meta */}
          <div className="text-[11px] space-y-1 border-b border-dashed border-slate-400 pb-3">
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span className="font-bold text-slate-900 dark:text-white">{receipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Invoice Ref:</span>
              <span>{receipt.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date/Time:</span>
              <span>{receipt.timestamp.substring(0, 16).replace("T", " ")}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{receipt.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-bold">{receipt.customerName}</span>
            </div>
          </div>

          {/* Purchased Parts Summary */}
          <div className="space-y-2 border-b border-dashed border-slate-400 pb-3">
            <div className="flex justify-between font-bold text-[10px] uppercase text-slate-400">
              <span>Items</span>
              <span>Amt</span>
            </div>
            <p className="text-xs font-bold leading-normal">{receipt.itemsSummary}</p>
          </div>

          {/* Total Breakdown */}
          <div className="space-y-1 text-xs border-b border-dashed border-slate-400 pb-3">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-bold">{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1">
              <span>TOTAL PAID:</span>
              <span>{formatPrice(receipt.totalAmount)}</span>
            </div>
          </div>

          {/* Barcode Simulation */}
          <div className="text-center pt-2 space-y-1">
            <div className="h-10 bg-slate-900 text-white flex items-center justify-center font-mono tracking-widest rounded text-xs font-bold">
              ||| |||| || | ||||| || |||
            </div>
            <p className="text-[9px] text-slate-400">Thank you for choosing {settings.businessName || "ShelfSense"}!</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print Receipt (80mm)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
