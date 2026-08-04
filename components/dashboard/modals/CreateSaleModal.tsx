"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, ShoppingCart, User, CreditCard, Search, Building2, ChevronDown, Check } from "lucide-react";
import { LatestOrder } from "@/lib/types/dashboard";
import { useSettings } from "@/lib/context/SettingsContext";
import { CustomerSearchSelect, ICustomerInfo } from "@/components/sales/CustomerSearchSelect";

interface CreateSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleCreated: (sale: any) => void;
}

interface LineItem {
  productId: string;
  sku: string;
  name: string;
  quality: string;
  qty: number;
  unitPrice: number;
  available: number;
  searchQuery: string;
  searchResults: any[];
  dropdownOpen: boolean;
}

export const CreateSaleModal: React.FC<CreateSaleModalProps> = ({
  isOpen,
  onClose,
  onSaleCreated,
}) => {
  const { formatPrice, settings } = useSettings();

  const [customerId, setCustomerId] = useState("WALK_IN");
  const [customerName, setCustomerName] = useState("Express Walk-in Customer");
  const [customerType, setCustomerType] = useState<"Wholesale" | "Retail Repair" | "Enterprise Tech">("Wholesale");
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Partial" | "Unpaid">("Paid");
  
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouse, setWarehouse] = useState("Main Hub - Lagos");

  const [items, setItems] = useState<LineItem[]>([
    {
      productId: "",
      sku: "",
      name: "",
      quality: "OEM_ORIGINAL",
      qty: 1,
      unitPrice: 0,
      available: 0,
      searchQuery: "",
      searchResults: [],
      dropdownOpen: false,
    },
  ]);

  // Load warehouses from DB
  useEffect(() => {
    fetch("/api/warehouses")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          setWarehouses(json.data);
          setWarehouse(json.data[0].name);
        }
      })
      .catch((err) => console.error("Error fetching warehouses in modal:", err));
  }, []);

  // Reset line items when warehouse changes to prevent cross-warehouse inventory issues
  useEffect(() => {
    setItems([
      {
        productId: "",
        sku: "",
        name: "",
        quality: "OEM_ORIGINAL",
        qty: 1,
        unitPrice: 0,
        available: 0,
        searchQuery: "",
        searchResults: [],
        dropdownOpen: false,
      },
    ]);
  }, [warehouse]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        sku: "",
        name: "",
        quality: "OEM_ORIGINAL",
        qty: 1,
        unitPrice: 0,
        available: 0,
        searchQuery: "",
        searchResults: [],
        dropdownOpen: false,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemSearch = async (index: number, searchQuery: string) => {
    const updated = [...items];
    updated[index].searchQuery = searchQuery;
    updated[index].dropdownOpen = searchQuery.trim() !== "";
    setItems(updated);

    if (searchQuery.trim() === "") return;

    try {
      const res = await fetch(
        `/api/inventory?warehouse=${encodeURIComponent(warehouse)}&search=${encodeURIComponent(searchQuery)}`
      );
      const json = await res.json();
      if (json.success && json.data) {
        const copy = [...items];
        copy[index].searchResults = json.data;
        setItems(copy);
      }
    } catch (e) {
      console.error("Error searching items for sales order:", e);
    }
  };

  const handleSelectItem = (index: number, selectedInvItem: any) => {
    const updated = [...items];
    updated[index].productId = selectedInvItem._id || selectedInvItem.id;
    updated[index].sku = selectedInvItem.sku;
    updated[index].name = selectedInvItem.product;
    updated[index].quality = selectedInvItem.quality || "OEM_ORIGINAL";
    updated[index].unitPrice = selectedInvItem.sellingPrice || 0;
    updated[index].available = selectedInvItem.available || selectedInvItem.quantity || 0;
    updated[index].qty = 1;
    updated[index].searchQuery = "";
    updated[index].searchResults = [];
    updated[index].dropdownOpen = false;
    setItems(updated);
  };

  const handleQtyChange = (index: number, valueStr: string) => {
    const inputQty = parseInt(valueStr) || 1;
    const updated = [...items];
    // Clamp quantity to the available warehouse stock
    updated[index].qty = Math.min(updated[index].available, Math.max(1, inputQty));
    setItems(updated);
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, curr) => acc + curr.qty * curr.unitPrice, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if any items are unselected
    const selectedItems = items.filter((item) => item.sku !== "");
    if (selectedItems.length === 0) return;

    const totalAmount = calculateSubtotal();
    const newOrderNumber = `SO-2026-${Math.floor(9402 + Math.random() * 500)}`;

    const newOrder = {
      orderNumber: newOrderNumber,
      customerName,
      customerType,
      items: selectedItems.map((it) => ({
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: it.productId,
        sku: it.sku,
        name: it.name,
        quality: it.quality,
        quantity: it.qty,
        unitPrice: it.unitPrice,
        lineTotal: it.qty * it.unitPrice,
        warehouseSource: warehouse,
      })),
      totalAmount,
      paymentStatus,
      paymentMethod: paymentStatus === "Paid" ? ("Credit Card" as const) : ("Credit Line" as const),
      warehouse,
      fulfillmentStatus: "Awaiting Dispatch" as const,
    };

    onSaleCreated(newOrder);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Sales Order"
      description="Issue a new wholesale or retail sale with inventory reservation."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Customer & Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block mb-1">
              Customer Account
            </label>
            <CustomerSearchSelect
              value={customerId}
              onChange={(customer) => {
                if (customer) {
                  setCustomerId(customer.id);
                  setCustomerName(customer.name);
                  setCustomerType("Wholesale");
                } else {
                  setCustomerId("WALK_IN");
                  setCustomerName("Express Walk-in Customer");
                  setCustomerType("Retail Repair");
                }
              }}
            />
          </div>

          <Select
            label="Customer Type"
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value as any)}
            options={[
              { value: "Wholesale", label: "Wholesale Partner (Net 30)" },
              { value: "Retail Repair", label: "Retail Repair Shop (Express)" },
              { value: "Enterprise Tech", label: "Enterprise Telecom Client" },
            ]}
          />
        </div>

        {/* Warehouse & Payment Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Fulfill From Warehouse"
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            options={warehouses.map((w) => ({ value: w.name, label: w.name }))}
          />

          <Select
            label="Initial Payment Terms"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as any)}
            options={[
              { value: "Paid", label: "Paid Instant (Card / Stripe)" },
              { value: "Partial", label: "Deposit Paid (50% Down)" },
              { value: "Unpaid", label: "Invoice Issued (Unpaid Net 30)" },
            ]}
          />
        </div>

        {/* Items List */}
        <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Line Items & Parts
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleAddItem}
            >
              Add Line Item
            </Button>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs relative"
              >
                {item.sku === "" ? (
                  // Search Interface
                  <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type to search inventory parts in this warehouse..."
                      value={item.searchQuery}
                      onChange={(e) => handleItemSearch(idx, e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />

                    {item.dropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg z-50 max-h-40 overflow-y-auto p-1.5 space-y-1">
                        {item.searchResults.length === 0 ? (
                          <div className="p-2 text-[10px] text-slate-450 italic">
                            No parts available in {warehouse} matching query.
                          </div>
                        ) : (
                          item.searchResults.map((invItem) => (
                            <button
                              key={invItem._id || invItem.id}
                              type="button"
                              onClick={() => handleSelectItem(idx, invItem)}
                              className="w-full text-left p-1.5 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-800 rounded flex justify-between items-center cursor-pointer"
                            >
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">
                                  {invItem.product}
                                </span>
                                <span className="font-mono text-[9px] text-slate-400">
                                  {invItem.sku} • Bin: {invItem.shelf}
                                </span>
                              </div>
                              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                {invItem.available || invItem.quantity} avail
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Selected Product details view
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.sku} • {formatPrice(item.unitPrice)} ea
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Quantity</span>
                        <input
                          type="number"
                          min="1"
                          max={item.available}
                          value={item.qty}
                          onChange={(e) => handleQtyChange(idx, e.target.value)}
                          className="w-16 px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-center font-bold"
                        />
                        <span className="text-[9px] text-slate-450 block font-mono">
                          {item.available} max
                        </span>
                      </div>

                      <div className="w-20 text-right">
                        <span className="text-[10px] text-slate-400 block">Total</span>
                        <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                          {formatPrice(item.qty * item.unitPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1 text-slate-450 hover:text-rose-500 transition self-center shrink-0 cursor-pointer"
                  disabled={items.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Order Amount</span>
            <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {formatPrice(calculateSubtotal())}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={items.filter((i) => i.sku !== "").length === 0}
              icon={<ShoppingCart className="w-4 h-4" />}
            >
              Create & Dispatch Sale
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
