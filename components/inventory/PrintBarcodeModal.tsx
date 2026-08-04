"use client";

import React, { useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IInventoryItem } from "@/lib/types/inventory";
import { Printer, Download, QrCode } from "lucide-react";
import Barcode from "react-barcode";

export interface PrintBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: IInventoryItem[];
}

export const PrintBarcodeModal: React.FC<PrintBarcodeModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const windowUrl = "about:blank";
    const uniqueName = new Date().getTime();
    const printWindow = window.open(
      windowUrl,
      `print_window_${uniqueName}`,
      "left=50,top=50,width=800,height=600"
    );

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>ShelfSense - Barcode Label Printing</title>
            <style>
              body { font-family: monospace; padding: 20px; text-align: center; }
              .label-card { border: 1px solid #000; padding: 12px; margin: 10px auto; width: 280px; border-radius: 8px; page-break-inside: avoid; }
              .title { font-weight: bold; font-size: 12px; margin-bottom: 4px; }
              .sku { font-size: 14px; font-weight: bold; margin-bottom: 4px; }
              .details { font-size: 10px; color: #444; }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Print Barcode Labels (${selectedItems.length} items)`}
      description="Preview and print thermal barcode labels for shelf bins or packaging tags."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Printable Labels Container */}
        <div
          ref={printRef}
          className="p-6 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 max-h-[50vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {selectedItems.map((item) => (
            <div
              key={item._id}
              className="label-card bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-between text-center shadow-xs"
            >
              <div className="w-full text-left border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">ShelfSense Parts Tag</span>
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {item.product}
                </h5>
              </div>

              {/* Barcode Render */}
              <div className="my-1 flex items-center justify-center">
                <Barcode
                  value={item.barcode || item.sku}
                  width={1.5}
                  height={45}
                  fontSize={11}
                  margin={0}
                  background="transparent"
                />
              </div>

              <div className="w-full flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.sku}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Shelf: {item.shelf}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Compatible with Zebra, Dymo, and Standard 4x2 Thermal Label Printers.
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
              Print {selectedItems.length} Labels
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
