import React, { useState } from "react";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Bookmark,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { InventoryFilterOptions } from "@/lib/types/inventory";

export interface InventoryFilterBarProps {
  filters: InventoryFilterOptions;
  onFilterChange: (newFilters: InventoryFilterOptions) => void;
  onResetFilters: () => void;
  availableBrands?: string[];
  availableSuppliers?: string[];
  availableCategories?: string[];
  availableWarehouses?: string[];
}

export const InventoryFilterBar: React.FC<InventoryFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableBrands = [],
  availableSuppliers = [],
  availableCategories = [],
  availableWarehouses = [],
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFieldChange = (field: keyof InventoryFilterOptions, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  // Calculate total active non-empty filters
  const activeFilterCount = Object.entries(filters).filter(
    ([key, val]) => key !== "search" && Boolean(val)
  ).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3 dark:bg-slate-900 dark:border-slate-800">
      {/* Top Main Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Quick Search */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by SKU, Product title, Model, Barcode..."
            value={filters.search}
            onChange={(e) => handleFieldChange("search", e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Quick Dropdowns & Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Warehouse Dropdown */}
          <div className="w-44">
            <Select
              value={filters.warehouse}
              onChange={(e) => handleFieldChange("warehouse", e.target.value)}
              options={[
                { value: "", label: "All Warehouses" },
                ...availableWarehouses.map((w) => ({ value: w, label: w })),
              ]}
            />
          </div>

          {/* Brand Dropdown */}
          <div className="w-36">
            <Select
              value={filters.brand}
              onChange={(e) => handleFieldChange("brand", e.target.value)}
              options={[
                { value: "", label: "All Brands" },
                ...availableBrands.map((b) => ({ value: b, label: b })),
              ]}
            />
          </div>

          {/* Stock Status Dropdown */}
          <div className="w-40">
            <Select
              value={filters.status}
              onChange={(e) => handleFieldChange("status", e.target.value)}
              options={[
                { value: "", label: "All Stock Statuses" },
                { value: "IN_STOCK", label: "In Stock" },
                { value: "LOW_STOCK", label: "Low Stock Alert" },
                { value: "OUT_OF_STOCK", label: "Out of Stock" },
                { value: "DEAD_STOCK", label: "Dead Stock (>90d)" },
                { value: "OVERSTOCKED", label: "Overstocked" },
              ]}
            />
          </div>

          {/* Advanced Filters Button */}
          <Button
            variant={showAdvanced ? "primary" : "outline"}
            size="md"
            icon={<SlidersHorizontal className="w-4 h-4" />}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Reset Filters */}
          {(activeFilterCount > 0 || filters.search) && (
            <Button
              variant="ghost"
              size="md"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={onResetFilters}
              title="Reset all search & filters"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filter Collapsible Section */}
      {showAdvanced && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-1">
          {/* Supplier */}
          <Select
            label="Supplier"
            value={filters.supplier}
            onChange={(e) => handleFieldChange("supplier", e.target.value)}
            options={[
              { value: "", label: "All Suppliers" },
              ...availableSuppliers.map((s) => ({ value: s, label: s })),
            ]}
          />

          {/* Category */}
          <Select
            label="Part Category"
            value={filters.category}
            onChange={(e) => handleFieldChange("category", e.target.value)}
            options={[
              { value: "", label: "All Categories" },
              ...availableCategories.map((c) => ({ value: c, label: c })),
            ]}
          />

          {/* Quality Grade */}
          <Select
            label="Quality Grade"
            value={filters.quality}
            onChange={(e) => handleFieldChange("quality", e.target.value)}
            options={[
              { value: "", label: "All Quality Grades" },
              { value: "OEM_ORIGINAL", label: "OEM Original" },
              { value: "SERVICE_PACK", label: "Service Pack" },
              { value: "REFURBISHED_A", label: "Refurbished Grade A" },
              { value: "PREMIUM_AFTERMARKET", label: "Premium Aftermarket" },
            ]}
          />

          {/* Saved Filter Preset Actions */}
          <div className="flex flex-col justify-end gap-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Quick Filter Presets
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<Bookmark className="w-3.5 h-3.5" />}
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    status: "LOW_STOCK",
                    quality: "",
                  })
                }
              >
                Needs Reorder
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    quality: "OEM_ORIGINAL",
                  })
                }
              >
                OEM Only
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs font-semibold text-slate-500">Active Filters:</span>
          {Object.entries(filters).map(([key, value]) => {
            if (key === "search" || !value) return null;
            return (
              <Badge key={key} variant="neutral" size="sm" className="flex items-center gap-1.5 bg-slate-100 text-slate-800">
                <span className="capitalize font-bold text-slate-500">{key}:</span> {value}
                <button
                  onClick={() => handleFieldChange(key as keyof InventoryFilterOptions, "")}
                  className="hover:text-slate-900 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
