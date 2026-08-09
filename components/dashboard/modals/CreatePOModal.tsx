"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, Calendar, Plus, Trash2 } from "lucide-react";

interface CreatePOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPOCreated: (po: Record<string, unknown>) => void;
}

export const CreatePOModal: React.FC<CreatePOModalProps> = ({
  isOpen,
  onClose,
  onPOCreated,
}) => {
  const [supplier, setSupplier] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [items, setItems] = useState([{ sku: "", name: "", qty: 1, unitCost: 0 }]);
  const [supplierOptions, setSupplierOptions] = useState<{ value: string; label: string }[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<{ value: string; label: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        const [supRes, whRes] = await Promise.all([
          fetch("/api/suppliers", { credentials: "include" }),
          fetch("/api/warehouses", { credentials: "include" }),
        ]);
        const [supJson, whJson] = await Promise.all([supRes.json(), whRes.json()]);
        if (supJson.success) {
          const opts = (supJson.data || []).map((s: { name: string }) => ({
            value: s.name,
            label: s.name,
          }));
          setSupplierOptions(opts);
          if (opts[0]) setSupplier(opts[0].value);
        }
        if (whJson.success) {
          const opts = (whJson.data || []).map((w: { name: string }) => ({
            value: w.name,
            label: w.name,
          }));
          setWarehouseOptions(opts);
          if (opts[0]) setWarehouse(opts[0].value);
        }
      } catch {
        // empty options
      }
    };
    void load();
  }, [isOpen]);

  const handleAddItem = () => {
    setItems([...items, { sku: "", name: "", qty: 1, unitCost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => items.reduce((acc, curr) => acc + curr.qty * curr.unitCost, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = {
      poNumber: `PO-${Date.now().toString().slice(-6)}`,
      supplier,
      warehouse,
      expectedDate,
      totalUnits: items.reduce((acc, i) => acc + i.qty, 0),
      totalValue: calculateTotal(),
      status: "Awaiting Arrival",
      items,
    };

    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Failed to create purchase order");
        return;
      }
      onPOCreated(json.data);
      onClose();
      setItems([{ sku: "", name: "", qty: 1, unitCost: 0 }]);
      setExpectedDate("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create purchase order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Purchase Order (PO)"
      description="Issue a procurement order to primary factory suppliers."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Supplier Vendor"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            options={
              supplierOptions.length ? supplierOptions : [{ value: "", label: "No suppliers loaded" }]
            }
          />

          <Select
            label="Destination Warehouse"
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            options={
              warehouseOptions.length
                ? warehouseOptions
                : [{ value: "", label: "No warehouses loaded" }]
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Expected Shipment Arrival Date"
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            required
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>

        <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Procurement Line Items
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleAddItem}
            >
              Add PO Line Item
            </Button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-3">
                <Input
                  label={index === 0 ? "SKU" : undefined}
                  value={item.sku}
                  onChange={(e) => {
                    const next = [...items];
                    next[index] = { ...next[index], sku: e.target.value };
                    setItems(next);
                  }}
                  required
                />
              </div>
              <div className="col-span-4">
                <Input
                  label={index === 0 ? "Name" : undefined}
                  value={item.name}
                  onChange={(e) => {
                    const next = [...items];
                    next[index] = { ...next[index], name: e.target.value };
                    setItems(next);
                  }}
                  required
                />
              </div>
              <div className="col-span-2">
                <Input
                  label={index === 0 ? "Qty" : undefined}
                  type="number"
                  value={String(item.qty)}
                  onChange={(e) => {
                    const next = [...items];
                    next[index] = { ...next[index], qty: parseInt(e.target.value, 10) || 0 };
                    setItems(next);
                  }}
                  required
                />
              </div>
              <div className="col-span-2">
                <Input
                  label={index === 0 ? "Unit Cost" : undefined}
                  type="number"
                  step="0.01"
                  value={String(item.unitCost)}
                  onChange={(e) => {
                    const next = [...items];
                    next[index] = { ...next[index], unitCost: parseFloat(e.target.value) || 0 };
                    setItems(next);
                  }}
                  required
                />
              </div>
              <div className="col-span-1 pb-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Total: {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<ShoppingBag className="w-4 h-4" />}
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create PO"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
