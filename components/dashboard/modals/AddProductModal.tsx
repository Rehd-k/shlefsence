"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Package, Tag, DollarSign, Layers } from "lucide-react";
import { QualityGrade } from "@/lib/types/inventory";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (product: any) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
}) => {
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("Apple");
  const [phoneModel, setPhoneModel] = useState("iPhone 16 Pro Max");
  const [category, setCategory] = useState("Screen Replacement");
  const [quality, setQuality] = useState<QualityGrade>("OEM_ORIGINAL");
  const [cost, setCost] = useState("120.00");
  const [sellingPrice, setSellingPrice] = useState("195.00");
  const [quantity, setQuantity] = useState("25");
  const [warehouse, setWarehouse] = useState("Main Hub - New York");
  const [shelf, setShelf] = useState("A1-S2-B08");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSku = sku || `SCR-${brand.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const costNum = parseFloat(cost) || 0;
    const priceNum = parseFloat(sellingPrice) || 0;
    const qtyNum = parseInt(quantity) || 0;

    const newProduct = {
      _id: `prod-${Date.now()}`,
      sku: newSku,
      product: productName || `${phoneModel} ${category}`,
      brand,
      phoneModel,
      category,
      quality,
      cost: costNum,
      sellingPrice: priceNum,
      quantity: qtyNum,
      warehouse,
      shelf,
      createdAt: new Date().toISOString(),
    };

    onProductAdded(newProduct);
    onClose();
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
            options={[
              { value: "Apple", label: "Apple" },
              { value: "Samsung", label: "Samsung" },
              { value: "Google", label: "Google" },
              { value: "Xiaomi", label: "Xiaomi" },
              { value: "OnePlus", label: "OnePlus" },
            ]}
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
            options={[
              { value: "Screen Replacement", label: "Screen & OLED Assembly" },
              { value: "Battery", label: "High-Capacity Battery" },
              { value: "Charging Port", label: "Charging Port Flex Cable" },
              { value: "Camera Module", label: "Camera Module Unit" },
              { value: "Back Glass", label: "Rear Glass & Housing" },
              { value: "IC Micro Chip", label: "IC Chip & Logic Component" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Quality Grade"
            value={quality}
            onChange={(e) => setQuality(e.target.value as any)}
            options={[
              { value: "OEM_ORIGINAL", label: "OEM Original" },
              { value: "SERVICE_PACK", label: "Service Pack" },
              { value: "REFURBISHED_A", label: "Refurbished Grade A" },
              { value: "PREMIUM_AFTERMARKET", label: "Premium Aftermarket" },
            ]}
          />

          <Input
            label="Unit Cost ($)"
            type="number"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
            icon={<DollarSign className="w-4 h-4" />}
          />

          <Input
            label="Selling Price ($)"
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
            options={[
              { value: "Main Hub - New York", label: "Main Hub - NY" },
              { value: "West Coast Depot - LA", label: "West Coast Depot - LA" },
              { value: "Central Hub - Texas", label: "Central Hub - TX" },
            ]}
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
          <Button type="submit" variant="primary" icon={<Package className="w-4 h-4" />}>
            Save SKU to Catalog
          </Button>
        </div>
      </form>
    </Modal>
  );
};
