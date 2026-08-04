"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Truck, Plus, Save } from "lucide-react";

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSupplierCreated: () => void;
}

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  onSupplierCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    taxId: "",
    industry: "Consumer Electronics & Assemblies",
    status: "Active",
    paymentTerms: "Net 30",
    creditLimit: "100000",
    leadTime: "4 Days",
    contact: "",
    email: "",
    phone: "",
    website: "https://",
    street: "100 Logistics Blvd",
    city: "Shenzhen",
    state: "Guangdong",
    postalCode: "518000",
    country: "China",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        companyName: formData.companyName || formData.name,
        taxId: formData.taxId || "CN-91440300" + Math.floor(100000 + Math.random() * 900000),
        industry: formData.industry,
        status: formData.status,
        paymentTerms: formData.paymentTerms,
        creditLimit: parseFloat(formData.creditLimit) || 100000,
        leadTime: formData.leadTime,
        contact: formData.contact,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          addressType: "Manufacturing HQ",
        },
        contacts: [
          {
            id: `cnt-${Date.now()}`,
            name: formData.contact,
            role: "Primary Representative",
            email: formData.email,
            phone: formData.phone,
            isPrimary: true,
          },
        ],
        performance: {
          overallScore: 98.0,
          qualityPassRate: 99.0,
          onTimeDeliveryRate: 97.0,
          avgDeliveryDays: parseFloat(formData.leadTime) || 4.0,
          defectiveRate: 0.8,
          totalOrdersFulfilled: 0,
        },
        documents: [],
        communications: [],
      };

      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        onSupplierCreated();
        onClose();
      } else {
        alert(json.error || "Failed to create supplier");
      }
    } catch (err: any) {
      console.error("Add supplier error:", err);
      alert(err.message || "Failed to add supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Supplier & Manufacturer"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Supplier Vendor Name *"
            placeholder="e.g. Murata Electronics Japan"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Legal Company Name"
            placeholder="e.g. Murata Manufacturing Co., Ltd."
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />

          <Input
            label="Primary Rep Contact Name *"
            placeholder="e.g. Wei Zhang"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            required
          />

          <Input
            label="Contact Email *"
            type="email"
            placeholder="orders@vendor.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Phone Number *"
            placeholder="+86 755 8399 1000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <Select
            label="Industry Category"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            options={[
              { label: "Consumer Electronics & Assemblies", value: "Consumer Electronics & Assemblies" },
              { label: "Mobile Parts & Micro-Electronics", value: "Mobile Parts & Micro-Electronics" },
              { label: "Robotics & Drone Components", value: "Robotics & Drone Components" },
              { label: "Display Panels & Micro-LED", value: "Display Panels & Micro-LED" },
              { label: "NAND Storage & LPDDR Memory", value: "NAND Storage & LPDDR Memory" },
            ]}
          />

          <Select
            label="Tier Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            options={[
              { label: "Preferred Vendor", value: "Preferred" },
              { label: "Active Vendor", value: "Active" },
              { label: "Under Review", value: "Under Review" },
            ]}
          />

          <Select
            label="Payment Terms"
            value={formData.paymentTerms}
            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            options={[
              { label: "Net 30 Days", value: "Net 30" },
              { label: "Net 45 Days", value: "Net 45" },
              { label: "Net 60 Days", value: "Net 60" },
              { label: "Immediate Payment", value: "Immediate" },
            ]}
          />

          <Input
            label="Approved Credit Limit ($)"
            type="number"
            value={formData.creditLimit}
            onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
          />

          <Input
            label="Guaranteed Lead Time"
            placeholder="e.g. 4 Days"
            value={formData.leadTime}
            onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
          />
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
          <h4 className="font-bold text-slate-900 dark:text-white mb-2">Manufacturing Address</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Street Address"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
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
            icon={<Save className="w-4 h-4" />}
          >
            Create Supplier Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};
