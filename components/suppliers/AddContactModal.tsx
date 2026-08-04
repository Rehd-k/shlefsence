"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ISupplier } from "@/lib/types/supplier";
import { UserPlus, Save } from "lucide-react";

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: ISupplier | null;
  onContactAdded: () => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onContactAdded,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "Account Representative",
    email: "",
    phone: "",
    isPrimary: false,
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
          action: "ADD_CONTACT",
          contact: formData,
        }),
      });

      const json = await res.json();
      if (json.success) {
        onContactAdded();
        onClose();
        setFormData({
          name: "",
          role: "Account Representative",
          email: "",
          phone: "",
          isPrimary: false,
        });
      } else {
        alert(json.error || "Failed to add contact");
      }
    } catch (err: any) {
      console.error("Add contact error:", err);
      alert(err.message || "Failed to add contact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Contact Person - ${supplier.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="Full Name *"
          placeholder="e.g. David Miller"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label="Role / Title *"
          placeholder="e.g. Senior Logistics Coordinator"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
        />

        <Input
          label="Email Address *"
          type="email"
          placeholder="d.miller@supplier.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          label="Direct Phone Number *"
          placeholder="+1 (408) 912-3344"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />

        <Checkbox
          id="isPrimaryContact"
          label="Set as Primary Key Account Representative"
          checked={formData.isPrimary}
          onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
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
            icon={<Save className="w-4 h-4" />}
          >
            Add Contact
          </Button>
        </div>
      </form>
    </Modal>
  );
};
