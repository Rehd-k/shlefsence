"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Download, FileSpreadsheet, FileText, FileCode } from "lucide-react";

interface ExportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportTriggered: (format: string) => void;
}

export const ExportProductsModal: React.FC<ExportProductsModalProps> = ({
  isOpen,
  onClose,
  onExportTriggered,
}) => {
  const [format, setFormat] = useState("xlsx");
  const [warehouseFilter, setWarehouseFilter] = useState("All");

  const handleExport = () => {
    onExportTriggered(format);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Product Catalog Data"
      description="Download full inventory catalog with SKU prices, bin locations, and compatibility lists."
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        <Select
          label="Export File Format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          options={[
            { value: "xlsx", label: "Microsoft Excel Worksheet (.xlsx)" },
            { value: "csv", label: "Comma Separated Values (.csv)" },
            { value: "pdf", label: "PDF Catalog Printable (.pdf)" },
          ]}
        />

        <Select
          label="Warehouse Location Filter"
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          options={[
            { value: "All", label: "All Warehouses & Hubs" },
            { value: "NY", label: "Main Hub - New York" },
            { value: "LA", label: "West Coast Depot - LA" },
            { value: "TX", label: "Central Hub - Texas" },
          ]}
        />

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200">Export Summary:</p>
          <p>• Includes Barcode numbers, Quality grades, and Wholesale vs Retail pricing.</p>
          <p>• Ready for ERP audit compliance or partner distribution lists.</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
            Download Catalog ({format.toUpperCase()})
          </Button>
        </div>
      </div>
    </Modal>
  );
};
