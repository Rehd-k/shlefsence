"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Layers, CheckCircle } from "lucide-react";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: (category: any) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onCategoryAdded,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code, description }),
      });
      const json = await res.json();
      if (json.success) {
        onCategoryAdded(json.data);
        setName("");
        setCode("");
        setDescription("");
        onClose();
      }
    } catch (err) {
      console.error("Error creating category:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Inventory Category"
      description="Create a new spare parts classification to group related SKUs."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
        <Input
          label="Category Name"
          placeholder="e.g. Flex Cables & Ribbon Connectors"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          icon={<Layers className="w-4 h-4" />}
        />

        <Input
          label="Category Short Code"
          placeholder="e.g. FLX"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Brief description of parts included in this category..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-xs"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            variant="primary"
            icon={<CheckCircle className="w-4 h-4" />}
          >
            Create Category
          </Button>
        </div>
      </form>
    </Modal>
  );
};
