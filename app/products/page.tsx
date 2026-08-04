"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductHeaderActions } from "@/components/products/ProductHeaderActions";
import { ProductCardGrid } from "@/components/products/ProductCardGrid";
import { ProductDataTable } from "@/components/products/ProductDataTable";
import { ProductDetailsModal } from "@/components/products/ProductDetailsModal";
import { NewProductModal } from "@/components/products/modals/NewProductModal";
import { AddCategoryModal } from "@/components/products/modals/AddCategoryModal";
import { ImportProductsModal } from "@/components/products/modals/ImportProductsModal";
import { ExportProductsModal } from "@/components/products/modals/ExportProductsModal";
import { PrintBarcodeModal } from "@/components/products/modals/PrintBarcodeModal";
import { BulkUpdateModal } from "@/components/products/modals/BulkUpdateModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { IProduct } from "@/lib/types/product";
import { Search, Filter, RefreshCcw, CheckCircle, Package } from "lucide-react";

export default function ProductManagementPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [qualityFilter, setQualityFilter] = useState("All");

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPrintBarcodeOpen, setIsPrintBarcodeOpen] = useState(false);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (brandFilter !== "All") query.set("brand", brandFilter);
      if (categoryFilter !== "All") query.set("category", categoryFilter);
      if (qualityFilter !== "All") query.set("quality", qualityFilter);

      const res = await fetch(`/api/products?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, brandFilter, categoryFilter, qualityFilter]);

  // Selection handlers
  const handleSelectProduct = (id: string, isSelected: boolean) => {
    if (isSelected) setSelectedIds((prev) => [...prev, id]);
    else setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) setSelectedIds(filteredProducts.map((p) => p.id));
    else setSelectedIds([]);
  };

  const filteredProducts = products;

  const selectedObjects = useMemo(() => {
    return products.filter((p) => selectedIds.includes(p.id));
  }, [products, selectedIds]);

  // Modal submission handlers
  const handleProductCreated = async (newProd: IProduct) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProd),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => [json.data, ...prev]);
        triggerToast(`Created new product SKU "${newProd.name}" (${newProd.sku}) in Mongoose database.`);
      } else {
        triggerToast(`Error creating product: ${json.error}`);
      }
    } catch (err: any) {
      triggerToast(`Failed to save product: ${err.message}`);
    }
  };

  const handleImportCompleted = (count: number) => {
    fetchProducts();
    triggerToast(`Successfully imported ${count} phone spare part SKUs into database catalog.`);
  };

  const handleExportTriggered = (format: string) => {
    triggerToast(`Exporting product catalog as .${format.toUpperCase()}`);
  };

  const handlePrintCompleted = (labelCount: number) => {
    triggerToast(`Sent ${labelCount} barcode label jobs to printer queue.`);
  };

  const handleBulkUpdateCompleted = (action: string, val: any) => {
    if (action === "price") {
      const pct = 1 + val / 100;
      setProducts((prev) =>
        prev.map((p) => {
          if (!selectedIds.includes(p.id)) return p;
          return {
            ...p,
            wholesalePrice: Math.round(p.wholesalePrice * pct * 100) / 100,
            sellingPrice: Math.round(p.sellingPrice * pct * 100) / 100,
          };
        })
      );
      triggerToast(`Bulk price adjustment of ${val}% applied to ${selectedIds.length} items.`);
    } else if (action === "warehouse") {
      setProducts((prev) =>
        prev.map((p) => {
          if (!selectedIds.includes(p.id)) return p;
          return { ...p, warehouse: val };
        })
      );
      triggerToast(`Reassigned ${selectedIds.length} items to warehouse ${val}`);
    }
    setSelectedIds([]);
  };

  return (
    <AppLayout>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/40 flex items-center gap-3 text-xs font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Product Catalog Management
            </h1>
            <Badge variant="purple" size="sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {products.length} Active SKUs
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise phone spare parts catalog, barcode generation, volume pricing tiers, and compatibility matrix.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
            onClick={() => {
              fetchProducts();
              triggerToast("Catalog synchronized with Mongoose database.");
            }}
          >
            Refresh Catalog
          </Button>
        </div>
      </div>

      {/* 1. Top Action Toolbar */}
      <ProductHeaderActions
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewProduct={() => setIsNewProductOpen(true)}
        onAddCategory={() => setIsAddCategoryOpen(true)}
        onImportProducts={() => setIsImportOpen(true)}
        onExportProducts={() => setIsExportOpen(true)}
        onPrintBarcode={() => setIsPrintBarcodeOpen(true)}
        onBulkUpdate={() => setIsBulkUpdateOpen(true)}
        selectedCount={selectedIds.length}
      />

      {/* 2. Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by part title, SKU, barcode, compatible phone model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 border border-slate-200/80 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="w-32">
            <Select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              options={[
                { value: "All", label: "All Brands" },
                { value: "Apple", label: "Apple" },
                { value: "Samsung", label: "Samsung" },
                { value: "Google", label: "Google" },
                { value: "Xiaomi", label: "Xiaomi" },
              ]}
            />
          </div>

          <div className="w-40">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: "All", label: "All Categories" },
                { value: "Screen & OLED Assembly", label: "Screens & OLED" },
                { value: "High-Capacity Battery", label: "Batteries" },
                { value: "Charging Port Flex", label: "Charging Ports" },
                { value: "Camera Module", label: "Camera Modules" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* 3. Product Display (Cards Grid or Enterprise Data Table) */}
      {viewMode === "grid" ? (
        <ProductCardGrid
          products={filteredProducts}
          selectedIds={selectedIds}
          onSelectProduct={handleSelectProduct}
          onViewDetails={(prod) => {
            setSelectedProduct(prod);
            setIsDetailsOpen(true);
          }}
          onPrintBarcode={(prod) => {
            setSelectedProduct(prod);
            setIsPrintBarcodeOpen(true);
          }}
        />
      ) : (
        <ProductDataTable
          products={filteredProducts}
          selectedIds={selectedIds}
          onSelectProduct={handleSelectProduct}
          onSelectAll={handleSelectAll}
          onViewDetails={(prod) => {
            setSelectedProduct(prod);
            setIsDetailsOpen(true);
          }}
          onPrintBarcode={(prod) => {
            setSelectedProduct(prod);
            setIsPrintBarcodeOpen(true);
          }}
        />
      )}

      {/* 4. MODALS & 9-TAB PRODUCT DETAILS DRAWER */}
      <ProductDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        product={selectedProduct}
        onPrintBarcode={(prod) => {
          setIsDetailsOpen(false);
          setIsPrintBarcodeOpen(true);
        }}
      />

      <NewProductModal
        isOpen={isNewProductOpen}
        onClose={() => setIsNewProductOpen(false)}
        onProductCreated={handleProductCreated}
      />

      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onCategoryAdded={(cat) => {
          triggerToast(`New Inventory Category "${cat.name}" created!`);
        }}
      />

      <ImportProductsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportCompleted={handleImportCompleted}
      />

      <ExportProductsModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExportTriggered={handleExportTriggered}
      />

      <PrintBarcodeModal
        isOpen={isPrintBarcodeOpen}
        onClose={() => setIsPrintBarcodeOpen(false)}
        selectedProducts={selectedObjects.length > 0 ? selectedObjects : selectedProduct ? [selectedProduct] : []}
        onPrintCompleted={handlePrintCompleted}
      />

      <BulkUpdateModal
        isOpen={isBulkUpdateOpen}
        onClose={() => setIsBulkUpdateOpen(false)}
        selectedProducts={selectedObjects}
        onBulkUpdateCompleted={handleBulkUpdateCompleted}
      />
    </AppLayout>
  );
}
