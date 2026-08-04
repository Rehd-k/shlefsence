"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ISupplier } from "@/lib/types/supplier";
import { MessageSquare, Send } from "lucide-react";

interface LogCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: ISupplier | null;
  onLogged: () => void;
}

export const LogCommunicationModal: React.FC<LogCommunicationModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onLogged,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "Meeting",
    subject: "",
    summary: "",
    author: "Alex Rivers",
    date: new Date().toISOString().split("T")[0],
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
          action: "ADD_COMMUNICATION",
          communication: formData,
        }),
      });

      const json = await res.json();
      if (json.success) {
        onLogged();
        onClose();
        setFormData({
          type: "Meeting",
          subject: "",
          summary: "",
          author: "Alex Rivers",
          date: new Date().toISOString().split("T")[0],
        });
      } else {
        alert(json.error || "Failed to log interaction");
      }
    } catch (err: any) {
      console.error("Log communication error:", err);
      alert(err.message || "Failed to log communication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Communication - ${supplier.name}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Interaction Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { label: "Meeting / Sync", value: "Meeting" },
              { label: "Email Exchange", value: "Email" },
              { label: "Phone Call", value: "Call" },
              { label: "Internal Note", value: "Note" },
            ]}
          />

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <Input
          label="Subject / Topic *"
          placeholder="e.g. Q3 Component Allocation & Price Lock"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        />

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Interaction Summary & Action Items *
          </label>
          <textarea
            rows={4}
            placeholder="Summarize key discussion points, commitments, delivery updates, or contract details..."
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
            required
          />
        </div>

        <Input
          label="Logged By"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={loading}
            icon={<Send className="w-4 h-4" />}
          >
            Save Interaction Log
          </Button>
        </div>
      </form>
    </Modal>
  );
};
