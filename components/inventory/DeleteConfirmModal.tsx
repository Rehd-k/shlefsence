"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IInventoryItem } from "@/lib/types/inventory";
import { AlertTriangle, Trash2 } from "lucide-react";

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: IInventoryItem[];
  onConfirmDelete: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  onConfirmDelete,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete ${selectedItems.length} Inventory Item(s)`}
      description="Permanent action. Deleted items cannot be restored to active warehouse stock."
    >
      <div className="space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl dark:bg-rose-950/40 dark:border-rose-800/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 dark:text-rose-200 space-y-1">
            <span className="font-bold block">Are you sure you want to remove these stock items?</span>
            <p>
              Deleting inventory records will remove their stock metrics and barcode links. Associated historical movement logs will be archived for audit compliance.
            </p>
          </div>
        </div>

        {/* Selected List */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto space-y-1 text-xs dark:bg-slate-800 dark:border-slate-700">
          {selectedItems.map((item) => (
            <div key={item._id} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="font-mono font-bold">{item.sku}</span>
              <span className="truncate max-w-[200px]">{item.product}</span>
              <span className="text-slate-500 font-medium">Qty: {item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Modal Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
          >
            Permanently Delete Items
          </Button>
        </div>
      </div>
    </Modal>
  );
};
