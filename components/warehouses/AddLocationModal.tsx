"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Building2, MapPin, User, CheckCircle } from "lucide-react";

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationAdded: (location: any) => void;
}

export const AddLocationModal: React.FC<AddLocationModalProps> = ({
  isOpen,
  onClose,
  onLocationAdded,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<"Main Hub" | "Regional Depot" | "Retail Branch">("Retail Branch");
  const [address, setAddress] = useState("");
  const [manager, setManager] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;
    setLoading(true);

    try {
      const res = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code: code || `LOC-${Math.floor(10 + Math.random() * 90)}`,
          type,
          address,
          manager: manager || "Store Supervisor",
          skusCount: 0,
          capacity: "20% Capacity",
        }),
      });
      const json = await res.json();
      if (json.success) {
        onLocationAdded(json.data);
        setName("");
        setCode("");
        setAddress("");
        setManager("");
        onClose();
      }
    } catch (err) {
      console.error("Error adding location:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Warehouse or Shop Location"
      description="Register a new distribution hub, regional depot, or retail shop counter."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
        <Input
          label="Location Name"
          placeholder="e.g. Ikeja Computer Village Shop Counter"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          icon={<Building2 className="w-4 h-4" />}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Location Code"
            placeholder="e.g. SHP-IKJ01"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <Select
            label="Location Type"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            options={[
              { value: "Main Hub", label: "Main Central Hub" },
              { value: "Regional Depot", label: "Regional Depot" },
              { value: "Retail Branch", label: "Retail Shop Counter" },
            ]}
          />
        </div>

        <Input
          label="Physical Street Address"
          placeholder="e.g. 15 Otigba Street, Computer Village, Ikeja, Lagos"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          icon={<MapPin className="w-4 h-4" />}
        />

        <Input
          label="Manager / Lead Supervisor"
          placeholder="e.g. Chukwuemeka Obi"
          value={manager}
          onChange={(e) => setManager(e.target.value)}
          icon={<User className="w-4 h-4" />}
        />

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
            Create Location
          </Button>
        </div>
      </form>
    </Modal>
  );
};
