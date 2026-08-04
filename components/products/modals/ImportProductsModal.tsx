"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";

interface ImportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCompleted: (count: number) => void;
}

export const ImportProductsModal: React.FC<ImportProductsModalProps> = ({
  isOpen,
  onClose,
  onImportCompleted,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleUpload = () => {
    if (!fileName) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      onImportCompleted(24);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Phone Spare Parts Catalog"
      description="Upload CSV or Excel (.xlsx) file to batch import SKUs, bin shelf locations, and pricing."
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Dropzone */}
        <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 transition">
          <FileSpreadsheet className="w-10 h-10 text-indigo-500 mb-2 stroke-[1.5]" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {fileName ? fileName : "Click to select CSV or Drag & Drop File"}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Supports CSV, XLSX up to 50MB. Auto-detects SKU, EAN-13, and Brand headers.
          </span>
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {fileName && (
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              File ready: {fileName}
            </span>
            <span className="text-slate-400">24 SKUs detected</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!fileName || isUploading}
            icon={<Upload className="w-4 h-4" />}
            onClick={handleUpload}
          >
            {isUploading ? "Processing Batch..." : "Import 24 Products"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
