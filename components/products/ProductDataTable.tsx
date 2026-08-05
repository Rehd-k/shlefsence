"use client";

import React from "react";
import { IProduct } from "@/lib/types/product";
import { Badge } from "@/components/ui/Badge";
import { Printer, ExternalLink, Shield } from "lucide-react";
import { clsx } from "clsx";
import { formatCurrency } from "@/lib/utils/formatCurrency";

interface ProductDataTableProps {
  products: IProduct[];
  selectedIds: string[];
  onSelectProduct: (id: string, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onViewDetails: (product: IProduct) => void;
  onPrintBarcode: (product: IProduct) => void;
}

export const ProductDataTable: React.FC<ProductDataTableProps> = ({
  products,
  selectedIds,
  onSelectProduct,
  onSelectAll,
  onViewDetails,
  onPrintBarcode,
}) => {
  const isAllSelected = products.length > 0 && selectedIds.length === products.length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] sticky top-0 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3 w-8">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3">Product Part</th>
              <th className="px-4 py-3">SKU & Barcode</th>
              <th className="px-4 py-3">Brand & Quality</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3 text-right">Cost</th>
              <th className="px-4 py-3 text-right">Wholesale</th>
              <th className="px-4 py-3 text-right">Retail</th>
              <th className="px-4 py-3">Warehouse Bin</th>
              <th className="px-4 py-3">Stock Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {products.map((prod) => {
              const isSelected = selectedIds.includes(prod.id);
              return (
                <tr
                  key={prod.id}
                  className={clsx(
                    "hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer",
                    isSelected && "bg-indigo-50/40 dark:bg-indigo-950/30"
                  )}
                  onClick={() => onViewDetails(prod)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectProduct(prod.id, e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>

                  {/* Image & Title */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="max-w-xs">
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{prod.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          Fits: {prod.compatibleModels.join(", ")}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* SKU & Barcode */}
                  <td className="px-4 py-3">
                    <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{prod.sku}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{prod.barcode}</p>
                  </td>

                  {/* Brand & Quality */}
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{prod.brand}</p>
                    <Badge variant="purple" size="sm">
                      {prod.quality.replace("_", " ")}
                    </Badge>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{prod.category}</td>

                  {/* Supplier */}
                  <td className="px-4 py-3 text-slate-400 truncate max-w-[120px]">{prod.supplier}</td>

                  {/* Cost (₦) */}
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(prod.purchasePrice)}
                  </td>

                  {/* Wholesale (₦) */}
                  <td className="px-4 py-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(prod.wholesalePrice)}
                  </td>

                  {/* Retail (₦) */}
                  <td className="px-4 py-3 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(prod.sellingPrice)}
                  </td>

                  {/* Warehouse & Shelf Bin */}
                  <td className="px-4 py-3">
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{prod.shelf}</p>
                    <p className="text-[10px] text-slate-400">{prod.warehouse.split("-")[0]}</p>
                  </td>

                  {/* Stock Status */}
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono",
                        prod.stock.status === "OUT_OF_STOCK"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                          : prod.stock.status === "LOW_STOCK"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      )}
                    >
                      {prod.stock.available} avail ({prod.stock.reserved} res)
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onPrintBarcode(prod)}
                        className="p-1.5 rounded text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 transition cursor-pointer"
                        title="Print Barcode Label"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onViewDetails(prod)}
                        className="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition cursor-pointer"
                        title="View Product Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
