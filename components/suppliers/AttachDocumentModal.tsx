"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ISupplier } from "@/lib/types/supplier";
import { Upload, Paperclip } from "lucide-react";

interface AttachDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: ISupplier | null;
  onAttached: () => void;
}

export const AttachDocumentModal: React.FC<AttachDocumentModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onAttached,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "Contract",
    fileUrl: "https://shelfsense.internal/docs/contracts/supplier_doc.pdf",
    fileSize: "1.8 MB",
  });

  if (!supplier) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/suppliers/${supplier.id || supplier._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ATTACH_DOCUMENT",
          document: formData,
        }),
      });

      const json = await res.json();
      if (json.success) {
        onAttached();
        onClose();
        setFormData({
          title: "",
          type: "Contract",
          fileUrl: "https://shelfsense.internal/docs/contracts/supplier_doc.pdf",
          fileSize: "1.8 MB",
        });
      } else {
        alert(json.error || "Failed to attach document");
      }
    } catch (err: any) {
      console.error("Attach document error:", err);
      alert(err.message || "Failed to attach document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Attach Document - ${supplier.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="Document Title *"
          placeholder="e.g. Master Supply Agreement 2026-2028"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <Select
          label="Document Classification"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          options={[
            { label: "Master Contract / Agreement", value: "Contract" },
            { label: "ISO / Quality Certification", value: "ISO Certification" },
            { label: "Tax & W-9 / EIN Form", value: "Tax Form" },
            { label: "Mutual NDA Agreement", value: "NDA" },
            { label: "OEM Component Price List", value: "Price List" },
            { label: "Compliance & Safety Certificate", value: "Compliance" },
          ]}
        />

        <Input
          label="File Size Tag"
          placeholder="e.g. 2.4 MB"
          value={formData.fileSize}
          onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
        />

        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center space-y-1">
          <Upload className="w-6 h-6 mx-auto text-indigo-500" />
          <p className="font-bold text-slate-800 dark:text-slate-200">
            Click or drag file to simulate upload
          </p>
          <p className="text-[11px] text-slate-400">
            PDF, DOCX, XLSX up to 25MB supported
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={loading}
            icon={<Paperclip className="w-4 h-4" />}
          >
            Attach to Document Vault
          </Button>
        </div>
      </form>
    </Modal>
  );
};
