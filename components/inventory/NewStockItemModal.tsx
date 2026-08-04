"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Package, Tag, Layers, Warehouse, Plus, ChevronDown, Check, Sparkles, User, MapPin } from "lucide-react";
import { useSettings } from "@/lib/context/SettingsContext";

interface NewStockItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStockAdded: () => void;
}

export const NewStockItemModal: React.FC<NewStockItemModalProps> = ({
  isOpen,
  onClose,
  onStockAdded,
}) => {
  const { formatPrice, settings } = useSettings();

  // Form Fields
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");
  const [phoneModel, setPhoneModel] = useState("");
  const [category, setCategory] = useState("");
  const [quality, setQuality] = useState("OEM_ORIGINAL");
  const [supplier, setSupplier] = useState("");
  const [cost, setCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [reorderPoint, setReorderPoint] = useState("5");
  const [barcode, setBarcode] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [shelf, setShelf] = useState("");

  // Autocomplete Lists
  const [productsList, setProductsList] = useState<any[]>([]);
  const [suppliersList, setSuppliersList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [warehousesList, setWarehousesList] = useState<any[]>([]);
  const [binsList, setBinsList] = useState<any[]>([]);

  // Dropdown Toggles
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [showWarehouseSuggestions, setShowWarehouseSuggestions] = useState(false);
  const [showBinSuggestions, setShowBinSuggestions] = useState(false);

  // References for outside click detection
  const productRef = useRef<HTMLDivElement>(null);
  const supplierRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const warehouseRef = useRef<HTMLDivElement>(null);
  const binRef = useRef<HTMLDivElement>(null);

  // Load Initial Datasets
  useEffect(() => {
    // Fetch products for autocomplete
    fetch("/api/products")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setProductsList(json.data);
      })
      .catch((err) => console.error("Error loading products:", err));

    // Fetch suppliers
    fetch("/api/suppliers")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setSuppliersList(json.data);
      })
      .catch((err) => console.error("Error loading suppliers:", err));

    // Fetch categories
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setCategoriesList(json.data);
      })
      .catch((err) => console.error("Error loading categories:", err));

    // Fetch warehouses
    fetch("/api/warehouses")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setWarehousesList(json.data);
          if (json.data.length > 0) {
            setWarehouse(json.data[0].name);
          }
        }
      })
      .catch((err) => console.error("Error loading warehouses:", err));
  }, []);

  // Fetch bins based on active warehouse selection
  useEffect(() => {
    const matchedWarehouse = warehousesList.find(
      (w) => w.name.toLowerCase() === warehouse.toLowerCase()
    );
    if (!matchedWarehouse) {
      setBinsList([]);
      return;
    }

    fetch(`/api/warehouses/hierarchy?warehouseId=${matchedWarehouse.id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.bins) {
          setBinsList(json.data.bins);
        }
      })
      .catch((err) => console.error("Error loading warehouse bins:", err));
  }, [warehouse, warehousesList]);

  // Click Outside Handler
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (productRef.current && !productRef.current.contains(e.target as Node)) {
        setShowProductSuggestions(false);
      }
      if (supplierRef.current && !supplierRef.current.contains(e.target as Node)) {
        setShowSupplierSuggestions(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setShowCategorySuggestions(false);
      }
      if (warehouseRef.current && !warehouseRef.current.contains(e.target as Node)) {
        setShowWarehouseSuggestions(false);
      }
      if (binRef.current && !binRef.current.contains(e.target as Node)) {
        setShowBinSuggestions(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  // Generate barcode helper
  const handleGenerateBarcode = () => {
    const randomCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setBarcode(randomCode);
  };

  const handleSelectProduct = (prod: any) => {
    setProductName(prod.name);
    setSku(prod.sku || "");
    setBrand(prod.brand || "");
    setPhoneModel(prod.compatibleModels?.join(", ") || "");
    setCategory(prod.category || "");
    setQuality(prod.quality || "OEM_ORIGINAL");
    setSupplier(prod.supplier || "");
    setCost(prod.purchasePrice?.toString() || "");
    setSellingPrice(prod.sellingPrice?.toString() || "");
    setBarcode(prod.barcode || "");
    setShowProductSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !sku || !warehouse || !shelf) return;

    const payload = {
      sku,
      product: productName,
      brand: brand || "Generic",
      phoneModel: phoneModel || "Universal",
      category: category || "Other Parts",
      quality,
      supplier: supplier || "Unknown",
      warehouse,
      shelf,
      quantity: parseInt(quantity) || 0,
      reserved: 0,
      cost: parseFloat(cost) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      reorderPoint: parseInt(reorderPoint) || 10,
      barcode: barcode || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
    };

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        onStockAdded();
        onClose();
        // Clear Form fields
        setProductName("");
        setSku("");
        setBrand("");
        setPhoneModel("");
        setCategory("");
        setSupplier("");
        setCost("");
        setSellingPrice("");
        setBarcode("");
        setShelf("");
      } else {
        alert(`Failed to add stock: ${json.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting new stock item.");
    }
  };

  // Autocomplete suggestions filters
  const filteredProducts = productsList.filter((p) =>
    p.name.toLowerCase().includes(productName.toLowerCase()) ||
    p.sku.toLowerCase().includes(productName.toLowerCase())
  );

  const filteredSuppliers = suppliersList.filter((s) =>
    s.name.toLowerCase().includes(supplier.toLowerCase())
  );

  const filteredCategories = categoriesList.filter((c) =>
    c.name.toLowerCase().includes(category.toLowerCase())
  );

  const filteredWarehouses = warehousesList.filter((w) =>
    w.name.toLowerCase().includes(warehouse.toLowerCase())
  );

  const filteredBins = binsList.filter((b) =>
    b.binCode.toLowerCase().includes(shelf.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Stock Item to Warehouse"
      description="Record a new inventory part level, specify storage warehouse/bin shelf, and create initial movement logs."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
        {/* Product Search / Autocomplete Title & SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative" ref={productRef}>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Product Title / Part Name
            </label>
            <input
              type="text"
              placeholder="Type to search or write new e.g. iPhone 15 Pro OLED Assembly"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                setShowProductSuggestions(true);
              }}
              onFocus={() => setShowProductSuggestions(true)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none"
              required
            />
            {showProductSuggestions && productName.trim() !== "" && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 max-h-40 overflow-y-auto p-1.5 space-y-1">
                {filteredProducts.length === 0 ? (
                  <div className="p-2 text-[10px] text-slate-400 italic">
                    No matching catalog item. Will create as a new part model.
                  </div>
                ) : (
                  filteredProducts.slice(0, 5).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProduct(p)}
                      className="w-full text-left p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded flex justify-between items-center cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{p.sku}</span>
                      </div>
                      <span className="text-[9px] bg-indigo-500/10 text-indigo-500 px-1 py-0.5 rounded font-mono uppercase">
                        {p.brand}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              SKU Code
            </label>
            <input
              type="text"
              placeholder="e.g. SCR-IP15PM-OEM"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none font-mono"
              required
            />
          </div>
        </div>

        {/* Brand, Model, Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Brand / Manufacturer
            </label>
            <input
              type="text"
              placeholder="e.g. Apple, Samsung"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Phone Model Compatibility
            </label>
            <input
              type="text"
              placeholder="e.g. iPhone 15 Pro Max"
              value={phoneModel}
              onChange={(e) => setPhoneModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="relative" ref={categoryRef}>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Part Category
            </label>
            <input
              type="text"
              placeholder="e.g. Screen Replacement"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setShowCategorySuggestions(true);
              }}
              onFocus={() => setShowCategorySuggestions(true)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none"
              required
            />
            {showCategorySuggestions && category.trim() !== "" && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 max-h-40 overflow-y-auto p-1.5 space-y-1">
                {filteredCategories.slice(0, 5).map((c) => (
                  <button
                    key={c.id || c._id}
                    type="button"
                    onClick={() => {
                      setCategory(c.name);
                      setShowCategorySuggestions(false);
                    }}
                    className="w-full text-left p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quality, Supplier, Barcode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Quality Grade"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            options={[
              { value: "OEM_ORIGINAL", label: "OEM Original" },
              { value: "SERVICE_PACK", label: "Service Pack" },
              { value: "REFURBISHED_A", label: "Refurbished Grade A" },
              { value: "PREMIUM_AFTERMARKET", label: "Premium Aftermarket" },
            ]}
          />

          <div className="relative" ref={supplierRef}>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Supplier Partner
            </label>
            <input
              type="text"
              placeholder="e.g. Foxconn Electronics"
              value={supplier}
              onChange={(e) => {
                setSupplier(e.target.value);
                setShowSupplierSuggestions(true);
              }}
              onFocus={() => setShowSupplierSuggestions(true)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none"
              required
            />
            {showSupplierSuggestions && supplier.trim() !== "" && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 max-h-40 overflow-y-auto p-1.5 space-y-1">
                {filteredSuppliers.slice(0, 5).map((s) => (
                  <button
                    key={s.id || s._id}
                    type="button"
                    onClick={() => {
                      setSupplier(s.name);
                      setShowSupplierSuggestions(false);
                    }}
                    className="w-full text-left p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex justify-between items-center">
              <span>UPC/EAN Barcode</span>
              <button
                type="button"
                onClick={handleGenerateBarcode}
                className="text-[10px] text-indigo-500 font-bold hover:underline cursor-pointer"
              >
                Auto-Gen
              </button>
            </label>
            <input
              type="text"
              placeholder="Scan or auto-generate code"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Cost, Selling Price, Quantity, Reorder Point */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Unit Cost ({settings.currencyDefault})
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Selling Price ({settings.currencyDefault})
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Initial Quantity
            </label>
            <input
              type="number"
              placeholder="10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Reorder Point Alert
            </label>
            <input
              type="number"
              placeholder="5"
              value={reorderPoint}
              onChange={(e) => setReorderPoint(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Location Assignment: Warehouse & Shelf Bin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="relative" ref={warehouseRef}>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Target Warehouse Location
            </label>
            <input
              type="text"
              placeholder="Type to search or write warehouse name..."
              value={warehouse}
              onChange={(e) => {
                setWarehouse(e.target.value);
                setShowWarehouseSuggestions(true);
              }}
              onFocus={() => setShowWarehouseSuggestions(true)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none"
              required
            />
            {showWarehouseSuggestions && warehouse.trim() !== "" && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 max-h-40 overflow-y-auto p-1.5 space-y-1">
                {filteredWarehouses.slice(0, 5).map((w) => (
                  <button
                    key={w.id || w._id}
                    type="button"
                    onClick={() => {
                      setWarehouse(w.name);
                      setShowWarehouseSuggestions(false);
                    }}
                    className="w-full text-left p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={binRef}>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Shelf / Bin Code
            </label>
            <input
              type="text"
              placeholder="Type to search bin codes e.g. ZA-R01-S1-B01"
              value={shelf}
              onChange={(e) => {
                setShelf(e.target.value);
                setShowBinSuggestions(true);
              }}
              onFocus={() => setShowBinSuggestions(true)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none font-mono"
              required
            />
            {showBinSuggestions && shelf.trim() !== "" && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 max-h-40 overflow-y-auto p-1.5 space-y-1">
                {filteredBins.length === 0 ? (
                  <div className="p-2 text-[10px] text-slate-400 italic">
                    No predefined bins. Type custom shelf location directly.
                  </div>
                ) : (
                  filteredBins.slice(0, 5).map((b) => (
                    <button
                      key={b.id || b._id}
                      type="button"
                      onClick={() => {
                        setShelf(b.binCode);
                        setShowBinSuggestions(false);
                      }}
                      className="w-full text-left p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded font-semibold font-mono text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      {b.binCode}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Add Item to Inventory
          </Button>
        </div>
      </form>
    </Modal>
  );
};
