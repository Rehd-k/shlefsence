"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, Truck, Calendar, Plus, Trash2 } from "lucide-react";

interface CreatePOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPOCreated: (po: any) => void;
}

export const CreatePOModal: React.FC<CreatePOModalProps> = ({
  isOpen,
  onClose,
  onPOCreated,
}) => {
  const [supplier, setSupplier] = useState("Foxconn Electronics Shenzhen");
  const [warehouse, setWarehouse] = useState("Main Hub - New York");
  const [expectedDate, setExpectedDate] = useState("2026-08-05");
  const [items, setItems] = useState([
    { sku: "SCR-IP15PM-OEM", name: "iPhone 15 Pro Max OLED Assembly", qty: 50, unitCost: 125.0 },
    { sku: "BAT-S24U-SER", name: "Galaxy S24 Ultra Battery Pack", qty: 100, unitCost: 16.5 },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { sku: "CAM-IP14P-ORIG", name: "iPhone 14 Pro Camera Sensor", qty: 25, unitCost: 65.0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((acc, curr) => acc + curr.qty * curr.unitCost, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const poNumber = `PO-2026-${Math.floor(8820 + Math.random() * 500)}`;
    const newPO = {
      id: `po-${Date.now()}`,
      poNumber,
      supplier,
      warehouse,
      expectedDate,
      totalUnits: items.reduce((acc, i) => acc + i.qty, 0),
      totalValue: calculateTotal(),
      status: "Pending Arrival",
      createdAt: new Date().toISOString(),
    };

    onPOCreated(newPO);
    onClose();
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Supplier Vendor"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            options={[
              { value: "Foxconn Electronics Shenzhen", label: "Foxconn Electronics Shenzhen" },
              { value: "Sunsky Technology Wholesale", label: "Sunsky Technology Wholesale" },
              { value: "DJI & Parts Global Corp", label: "DJI & Parts Global Corp" },
              { value: "LG Display Parts Ltd", label: "LG Display Parts Ltd" },
            ]}
          />

          <Select
            label="Destination Warehouse"
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            options={[
              { value: "Main Hub - New York", label: "Main Hub - New York" },
              { value: "West Coast Depot - LA", label: "West Coast Depot - LA" },
              { value: "Central Hub - Texas", label: "Central Hub - Texas" },
            ]}
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

        {/* PO Line Items */}
        <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Procurement Line Items
            </span>
            <Button type="button" variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={handleAddItem}>
              Add PO Line Item
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{item.sku}</p>
                </div>

                <div className="w-20">
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => {
                      const newQty = parseInt(e.target.value) || 1;
                      const copy = [...items];
                      copy[idx].qty = newQty;
                      setItems(copy);
                    }}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-center font-bold"
                  />
                </div>

                <div className="w-24 text-right">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    ${(item.qty * item.unitCost).toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition"
                  disabled={items.length === 1}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Purchase Order Value</span>
            <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              ${calculateTotal().toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={<ShoppingBag className="w-4 h-4" />}>
              Issue Purchase Order
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
