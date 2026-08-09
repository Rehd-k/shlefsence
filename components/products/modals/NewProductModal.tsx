"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Package, Tag, Image as ImageIcon, Shield, Plus, Check } from "lucide-react";
import { IProduct } from "@/lib/types/product";
import { QualityGrade } from "@/lib/types/inventory";

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (product: IProduct) => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  onProductCreated,
}) => {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [image, setImage] = useState("");
  
  // Custom list states
  const [brand, setBrand] = useState("Apple");
  const [brandsList, setBrandsList] = useState<{ value: string; label: string }[]>([]);
  const [newBrandName, setNewBrandName] = useState("");
  const [showAddBrand, setShowAddBrand] = useState(false);

  const [compatibleModels, setCompatibleModels] = useState("iPhone 16 Pro Max, iPhone 16 Pro");
  
  const [quality, setQuality] = useState<QualityGrade>("OEM_ORIGINAL");
  const [qualityList, setQualityList] = useState<{ value: string; label: string }[]>([]);
  const [newGradeName, setNewGradeName] = useState("");
  const [newGradeLabel, setNewGradeLabel] = useState("");
  const [showAddGrade, setShowAddGrade] = useState(false);

  const [category, setCategory] = useState("Screen & OLED Assembly");
  const [categoriesList, setCategoriesList] = useState<{ value: string; label: string }[]>([]);
  
  const [supplier, setSupplier] = useState("Foxconn Electronics Shenzhen");
  const [suppliersList, setSuppliersList] = useState<{ value: string; label: string }[]>([]);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [showAddSupplier, setShowAddSupplier] = useState(false);

  const [purchasePrice, setPurchasePrice] = useState("145000");
  const [wholesalePrice, setWholesalePrice] = useState("185000");
  const [sellingPrice, setSellingPrice] = useState("225000");
  const [warranty, setWarranty] = useState("12 Months OEM Warranty");
  
  const [warehouse, setWarehouse] = useState("Main Hub - Lagos");
  const [locationsList, setLocationsList] = useState<{ value: string; label: string }[]>([]);

  const [shelf, setShelf] = useState("A1-S2-B08");
  const [stockQty, setStockQty] = useState("30");

  useEffect(() => {
    // Load Categories
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const opts = json.data.map((c: any) => ({ value: c.name, label: c.name }));
          setCategoriesList(opts);
        }
      })
      .catch(() => {});

    // Load Brands
    fetch("/api/brands")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setBrandsList(json.data);
          if (json.data.length > 0) setBrand(json.data[0].value);
        }
      })
      .catch(() => {});

    // Load Quality Grades
    fetch("/api/quality-grades")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setQualityList(json.data);
          if (json.data.length > 0) setQuality(json.data[0].value);
        }
      })
      .catch(() => {});

    // Load Suppliers
    fetch("/api/suppliers")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const opts = json.data.map((s: any) => ({ value: s.name, label: s.name }));
          setSuppliersList(opts);
          if (opts.length > 0) setSupplier(opts[0].value);
        }
      })
      .catch(() => {});

    // Load Locations
    fetch("/api/warehouses")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const opts = json.data.map((w: any) => ({ value: w.name, label: w.name }));
          setLocationsList(opts);
          if (opts.length > 0) setWarehouse(opts[0].value);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBrandName.trim() }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setBrandsList((prev) => [...prev, json.data]);
        setBrand(json.data.value);
        setNewBrandName("");
        setShowAddBrand(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddGrade = async () => {
    if (!newGradeName.trim() || !newGradeLabel.trim()) return;
    try {
      const res = await fetch("/api/quality-grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGradeName.trim(),
          label: newGradeLabel.trim(),
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setQualityList((prev) => [...prev, json.data]);
        setQuality(json.data.value);
        setNewGradeName("");
        setNewGradeLabel("");
        setShowAddGrade(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) return;
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSupplierName.trim(),
          companyName: newSupplierName.trim(),
          contact: "Wholesale Manager",
          email: "sales@supplier-portal.com",
          phone: "+234 (0) 111-2222",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const newOpt = { value: json.data.name, label: json.data.name };
        setSuppliersList((prev) => [...prev, newOpt]);
        setSupplier(newOpt.value);
        setNewSupplierName("");
        setShowAddSupplier(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSku = sku || `SCR-${brand.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBarcode = barcode || `${Math.floor(8900000000000 + Math.random() * 900000000000)}`;
    const defaultImage = image || "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80";

    const costNum = parseFloat(purchasePrice) || 0;
    const wholesaleNum = parseFloat(wholesalePrice) || 0;
    const retailNum = parseFloat(sellingPrice) || 0;
    const qtyNum = parseInt(stockQty) || 0;

    const modelsArray = compatibleModels.split(",").map((m) => m.trim()).filter(Boolean);

    const newProduct: IProduct = {
      id: `prod-${Date.now()}`,
      sku: newSku,
      name: name || `${brand} ${category}`,
      image: defaultImage,
      barcode: newBarcode,
      brand,
      compatibleModels: modelsArray.length > 0 ? modelsArray : [brand],
      quality,
      category,
      supplier,
      purchasePrice: costNum,
      sellingPrice: retailNum,
      wholesalePrice: wholesaleNum,
      warranty,
      warehouse,
      shelf,
      stock: {
        total: qtyNum,
        available: Math.max(0, qtyNum - 2),
        reserved: 2,
        reorderPoint: 15,
        status: qtyNum === 0 ? "OUT_OF_STOCK" : qtyNum <= 15 ? "LOW_STOCK" : "IN_STOCK",
      },
      warehouseStocks: [
        { warehouse, shelf, quantity: qtyNum, reserved: 2, available: Math.max(0, qtyNum - 2), reorderPoint: 15 },
      ],
      pricingTiers: [
        { minQty: 1, price: retailNum, discountPercentage: 0 },
        { minQty: 10, price: wholesaleNum, discountPercentage: Math.round(((retailNum - wholesaleNum) / retailNum) * 100) },
      ],
      compatibilities: modelsArray.map((m) => ({
        modelName: m,
        brand,
        year: 2024,
        modelNumbers: ["A0001", "A0002"],
      })),
      purchaseHistory: [
        {
          poNumber: `PO-2026-${Math.floor(8820 + Math.random() * 100)}`,
          supplier,
          orderDate: new Date().toISOString().split("T")[0],
          receiveDate: new Date().toISOString().split("T")[0],
          quantity: qtyNum,
          unitCost: costNum,
          totalCost: qtyNum * costNum,
          status: "Received",
        },
      ],
      salesHistory: [],
      warrantyLogs: [],
      images: [{ id: `img-${Date.now()}`, url: defaultImage, title: "Primary Photo", isPrimary: true }],
      notes: [{ id: `n-${Date.now()}`, author: "System", role: "Inventory Lead", createdAt: new Date().toISOString(), content: "Initial catalog entry created." }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onProductCreated(newProduct);
    onClose();
  };

  const defaultCategoryOptions = [
    { value: "Screen & OLED Assembly", label: "Screen & OLED Assembly" },
    { value: "High-Capacity Battery", label: "High-Capacity Battery" },
    { value: "Charging Port Flex", label: "Charging Port Flex" },
    { value: "Camera Module", label: "Camera Module Unit" },
    { value: "Rear Glass & Housing", label: "Rear Glass & Housing" },
    { value: "IC Micro Chip", label: "IC Micro Chip" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Phone Spare Part Product"
      description="Register a complete SKU entry tied to a category with pricing."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Row 1: Name & SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Title"
            placeholder="e.g. iPhone 16 Pro OLED Display Assembly"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

        {/* Row 2: Barcode & Image URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Barcode (EAN-13 / UPC)"
            placeholder="e.g. 8901234567890"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />

          <Input
            label="Product Image URL"
            placeholder="https://..."
            value={image}
            onChange={(e) => setImage(e.target.value)}
            icon={<ImageIcon className="w-4 h-4" />}
          />
        </div>

        {/* Row 3: Brand, Compatible Models, Quality */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          {/* Brand Dynamic & Inline Add */}
          <div className="flex flex-col gap-1.5">
            <Select
              label="Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              options={brandsList}
            />
            {!showAddBrand ? (
              <button
                type="button"
                onClick={() => setShowAddBrand(true)}
                className="text-left text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                + Add custom brand
              </button>
            ) : (
              <div className="flex items-center gap-1.5 mt-1 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-lg border border-slate-200/50">
                <input
                  type="text"
                  placeholder="New Brand"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddBrand}
                  className="p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center justify-center"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBrand(false)}
                  className="text-xs text-slate-400 px-1 hover:text-slate-600"
                >
                  X
                </button>
              </div>
            )}
          </div>

          <Input
            label="Compatible Models (Comma Separated)"
            placeholder="e.g. iPhone 16 Pro Max, iPhone 16 Pro"
            value={compatibleModels}
            onChange={(e) => setCompatibleModels(e.target.value)}
            required
          />

          {/* Quality Grade Dynamic & Inline Add */}
          <div className="flex flex-col gap-1.5">
            <Select
              label="Quality Grade"
              value={quality}
              onChange={(e) => setQuality(e.target.value as any)}
              options={qualityList}
            />
            {!showAddGrade ? (
              <button
                type="button"
                onClick={() => setShowAddGrade(true)}
                className="text-left text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                + Add custom grade
              </button>
            ) : (
              <div className="flex flex-col gap-1 mt-1 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/50">
                <input
                  type="text"
                  placeholder="e.g. PREMIUM_A"
                  value={newGradeName}
                  onChange={(e) => setNewGradeName(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono"
                />
                <input
                  type="text"
                  placeholder="Label: Premium Grade A"
                  value={newGradeLabel}
                  onChange={(e) => setNewGradeLabel(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white mt-1"
                />
                <div className="flex justify-end gap-1 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowAddGrade(false)}
                    className="px-1.5 py-0.5 text-slate-400 text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddGrade}
                    className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[10px] font-bold"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 4: Category, Supplier, Warranty */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categoriesList.length > 0 ? categoriesList : defaultCategoryOptions}
          />

          {/* Supplier Dynamic & Inline Add */}
          <div className="flex flex-col gap-1.5">
            <Select
              label="Supplier Vendor"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              options={suppliersList}
            />
            {!showAddSupplier ? (
              <button
                type="button"
                onClick={() => setShowAddSupplier(true)}
                className="text-left text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                + Add custom supplier
              </button>
            ) : (
              <div className="flex items-center gap-1.5 mt-1 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-lg border border-slate-200/50">
                <input
                  type="text"
                  placeholder="New Supplier"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddSupplier}
                  className="p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center justify-center"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSupplier(false)}
                  className="text-xs text-slate-400 px-1 hover:text-slate-600"
                >
                  X
                </button>
              </div>
            )}
          </div>

          <Input
            label="Warranty Terms"
            placeholder="e.g. 12 Months OEM Warranty"
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
            icon={<Shield className="w-4 h-4" />}
          />
        </div>

        {/* Row 5: Pricing Matrix (Purchase, Wholesale, Selling) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 pt-3">
          <Input
            label="Purchase Price / Cost"
            type="number"
            step="100"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            required
          />

          <Input
            label="Wholesale Price"
            type="number"
            step="100"
            value={wholesalePrice}
            onChange={(e) => setWholesalePrice(e.target.value)}
            required
          />

          <Input
            label="Retail Selling Price"
            type="number"
            step="100"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            required
          />
        </div>

        {/* Row 6: Warehouse, Shelf, Initial Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 pt-3">
          <Select
            label="Assign Location"
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            options={locationsList}
          />

          <Input
            label="Shelf / Bin Location"
            placeholder="e.g. A1-S2-B08"
            value={shelf}
            onChange={(e) => setShelf(e.target.value)}
            required
          />

          <Input
            label="Initial Stock Quantity"
            type="number"
            min="0"
            value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
            required
          />
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={<Package className="w-4 h-4" />}>
            Create Product Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
};
