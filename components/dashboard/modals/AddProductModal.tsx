"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Package, Tag, DollarSign } from "lucide-react";
import { QualityGrade } from "@/lib/types/inventory";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (product: Record<string, unknown>) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
}) => {
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");
  const [phoneModel, setPhoneModel] = useState("");
  const [category, setCategory] = useState("");
  const [quality, setQuality] = useState<QualityGrade>("OEM_ORIGINAL");
  const [cost, setCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [shelf, setShelf] = useState("");
  const [brandOptions, setBrandOptions] = useState<{ value: string; label: string }[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<{ value: string; label: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        const [brandsRes, catsRes, whRes] = await Promise.all([
          fetch("/api/brands", { credentials: "include" }),
          fetch("/api/categories", { credentials: "include" }),
          fetch("/api/warehouses", { credentials: "include" }),
        ]);
        const [brandsJson, catsJson, whJson] = await Promise.all([
          brandsRes.json(),
          catsRes.json(),
          whRes.json(),
        ]);
        if (brandsJson.success) {
          const opts = (brandsJson.data || []).map((b: { name: string }) => ({
            value: b.name,
            label: b.name,
          }));
          setBrandOptions(opts);
          if (opts[0] && !brand) setBrand(opts[0].value);
        }
        if (catsJson.success) {
          const opts = (catsJson.data || []).map((c: { name: string }) => ({
            value: c.name,
            label: c.name,
          }));
          setCategoryOptions(opts);
          if (opts[0] && !category) setCategory(opts[0].value);
        }
        if (whJson.success) {
          const opts = (whJson.data || []).map((w: { name: string }) => ({
            value: w.name,
            label: w.name,
          }));
          setWarehouseOptions(opts);
          if (opts[0] && !warehouse) setWarehouse(opts[0].value);
        }
      } catch {
        // leave options empty; user can still type model/sku
      }
    };
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const newSku = sku || `SKU-${Date.now().toString().slice(-6)}`;
    const costNum = parseFloat(cost) || 0;
    const priceNum = parseFloat(sellingPrice) || 0;
    const qtyNum = parseInt(quantity, 10) || 0;

    const payload = {
      sku: newSku,
      name: productName || `${phoneModel} ${category}`.trim(),
      brand,
      phoneModel,
      category,
      quality,
      cost: costNum,
      sellingPrice: priceNum,
      wholesalePrice: priceNum,
      stock: { total: qtyNum, available: qtyNum },
      warehouse,
      shelf,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Failed to create product");
        return;
      }
      onProductAdded(json.data);
      onClose();
      setProductName("");
      setSku("");
      setPhoneModel("");
      setCost("");
      setSellingPrice("");
      setQuantity("");
      setShelf("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Phone Spare Part SKU"
      description="Register a new item in catalog with barcode and initial bin assignment."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Title"
            placeholder="e.g. iPhone 16 Pro OLED Assembly"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            icon={<Package className="w-4 h-4" />}
          />

          <Input
            label="SKU Code"
            placeholder="e.g. SCR-IP16P-OEM"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            icon={<Tag className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            options={brandOptions.length ? brandOptions : [{ value: "", label: "No brands loaded" }]}
          />

          <Input
            label="Target Phone Model"
            placeholder="e.g. iPhone 16 Pro Max"
            value={phoneModel}
            onChange={(e) => setPhoneModel(e.target.value)}
            required
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={
              categoryOptions.length ? categoryOptions : [{ value: "", label: "No categories loaded" }]
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Quality Grade"
            value={quality}
            onChange={(e) => setQuality(e.target.value as QualityGrade)}
            options={[
              { value: "OEM_ORIGINAL", label: "OEM Original" },
              { value: "SERVICE_PACK", label: "Service Pack" },
              { value: "REFURBISHED_A", label: "Refurbished Grade A" },
              { value: "PREMIUM_AFTERMARKET", label: "Premium Aftermarket" },
            ]}
          />

          <Input
            label="Unit Cost"
            type="number"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
            icon={<DollarSign className="w-4 h-4" />}
          />

          <Input
            label="Selling Price"
            type="number"
            step="0.01"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            required
            icon={<DollarSign className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 pt-3">
          <Input
            label="Initial Stock Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <Select
            label="Assign Warehouse"
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            options={
              warehouseOptions.length ? warehouseOptions : [{ value: "", label: "No warehouses loaded" }]
            }
          />

          <Input
            label="Bin Location"
            placeholder="e.g. A1-S2-B08"
            value={shelf}
            onChange={(e) => setShelf(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<Package className="w-4 h-4" />}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save SKU to Catalog"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
