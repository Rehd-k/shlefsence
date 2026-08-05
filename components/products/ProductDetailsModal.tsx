"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IProduct } from "@/lib/types/product";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import {
  Package,
  Boxes,
  DollarSign,
  Smartphone,
  ShoppingBag,
  ShoppingCart,
  Shield,
  Image as ImageIcon,
  FileText,
  Printer,
  Edit,
  Tag,
  Warehouse,
  AlertTriangle,
  Plus,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { clsx } from "clsx";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProduct | null;
  onPrintBarcode?: (product: IProduct) => void;
}

export type ProductTab =
  | "Overview"
  | "Inventory"
  | "Pricing"
  | "Compatible Phones"
  | "Purchase History"
  | "Sales History"
  | "Warranty"
  | "Images"
  | "Notes";

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
  onPrintBarcode,
}) => {
  const [activeTab, setActiveTab] = useState<ProductTab>("Overview");
  const [newNote, setNewNote] = useState("");

  if (!product) return null;

  const tabs: Array<{ id: ProductTab; label: string; icon: React.ElementType; badge?: string | number }> = [
    { id: "Overview", label: "Overview", icon: Package },
    { id: "Inventory", label: "Inventory", icon: Boxes, badge: product.stock.total },
    { id: "Pricing", label: "Pricing", icon: DollarSign },
    { id: "Compatible Phones", label: "Compatible Phones", icon: Smartphone, badge: product.compatibleModels.length },
    { id: "Purchase History", label: "Purchase History", icon: ShoppingBag, badge: product.purchaseHistory?.length || 0 },
    { id: "Sales History", label: "Sales History", icon: ShoppingCart, badge: product.salesHistory?.length || 0 },
    { id: "Warranty", label: "Warranty", icon: Shield },
    { id: "Images", label: "Images", icon: ImageIcon, badge: product.images?.length || 1 },
    { id: "Notes", label: "Notes", icon: FileText, badge: product.notes?.length || 0 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="4xl"
    >
      {/* Product Hero Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 -mt-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
                {product.brand}
              </span>
              <Badge variant="purple" size="sm">
                {product.quality.replace("_", " ")}
              </Badge>
              <Badge
                variant={
                  product.stock.status === "OUT_OF_STOCK"
                    ? "danger"
                    : product.stock.status === "LOW_STOCK"
                    ? "warning"
                    : "success"
                }
                size="sm"
              >
                {product.stock.status.replace("_", " ")}
              </Badge>
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              {product.name}
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
              <span>SKU: <strong className="text-slate-800 dark:text-slate-200">{product.sku}</strong></span>
              <span>Barcode: <strong className="text-slate-800 dark:text-slate-200">{product.barcode}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-2">
          {onPrintBarcode && (
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5 text-purple-500" />}
              onClick={() => onPrintBarcode(product)}
            >
              Print Label
            </Button>
          )}
        </div>
      </div>

      {/* 9 Tab Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto py-2.5 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={clsx(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display Area */}
      <div className="py-4 space-y-4">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "Overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-xs text-slate-400 font-bold uppercase">Wholesale Price</span>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                  {formatCurrency(product.wholesalePrice)}
                </p>
                <span className="text-[11px] text-slate-400">Retail: {formatCurrency(product.sellingPrice)}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-xs text-slate-400 font-bold uppercase">Total Stock Available</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                  {product.stock.available} <span className="text-xs font-normal text-slate-400">/ {product.stock.total} total</span>
                </p>
                <span className="text-[11px] text-slate-400">Reserved: {product.stock.reserved} units</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-xs text-slate-400 font-bold uppercase">Primary Bin Shelf</span>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
                  {product.shelf}
                </p>
                <span className="text-[11px] text-slate-400">{product.warehouse}</span>
              </div>
            </div>

            {/* Spec Attributes Matrix */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Technical Part Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Category</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{product.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Supplier Vendor</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{product.supplier}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Warranty Period</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{product.warranty}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Reorder Point</span>
                  <span className="font-bold text-amber-600 font-mono">{product.stock.reorderPoint} units</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY */}
        {activeTab === "Inventory" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Multi-Warehouse Bin Breakdown
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Warehouse Location</th>
                    <th className="px-4 py-3">Shelf Bin</th>
                    <th className="px-4 py-3">Available Qty</th>
                    <th className="px-4 py-3">Reserved Qty</th>
                    <th className="px-4 py-3">Total Qty</th>
                    <th className="px-4 py-3">Reorder Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {product.warehouseStocks?.map((wh, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{wh.warehouse}</td>
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{wh.shelf}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{wh.available}</td>
                      <td className="px-4 py-3 font-mono text-amber-600">{wh.reserved}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{wh.quantity}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{wh.reorderPoint} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PRICING */}
        {activeTab === "Pricing" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400 font-bold">Factory Unit Cost</span>
                <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200 font-mono mt-1">
                  {formatCurrency(product.purchasePrice)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900">
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">B2B Wholesale Price</span>
                <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                  {formatCurrency(product.wholesalePrice)}
                </p>
                <span className="text-[10px] text-indigo-500 font-bold">
                  Margin: {(((product.wholesalePrice - product.purchasePrice) / (product.wholesalePrice || 1)) * 100).toFixed(1)}%
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Retail Selling Price</span>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  {formatCurrency(product.sellingPrice)}
                </p>
                <span className="text-[10px] text-emerald-500 font-bold">
                  Margin: {(((product.sellingPrice - product.purchasePrice) / (product.sellingPrice || 1)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Volume Tier Schedule */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Volume Wholesale Tier Discounts
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Minimum Order Quantity</th>
                      <th className="px-4 py-3">Unit Tier Price</th>
                      <th className="px-4 py-3">Discount Off Retail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {product.pricingTiers?.map((tier, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 font-bold">{tier.minQty}+ units</td>
                        <td className="px-4 py-3 font-mono font-extrabold text-indigo-600 dark:text-indigo-400">{formatCurrency(tier.price)}</td>
                        <td className="px-4 py-3 text-emerald-600 font-bold">-{tier.discountPercentage}% OFF</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMPATIBLE PHONES */}
        {activeTab === "Compatible Phones" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Verified Compatible Phone Models
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.compatibilities?.map((comp, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{comp.modelName}</h4>
                    <p className="text-[11px] text-slate-400">Brand: {comp.brand} ({comp.year})</p>
                    <div className="flex items-center gap-1 mt-1 font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                      <span>Model Codes:</span>
                      <span className="font-bold">{comp.modelNumbers.join(", ")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PURCHASE HISTORY */}
        {activeTab === "Purchase History" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Procurement & PO Receiving Logs
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">PO Number</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Order Date</th>
                    <th className="px-4 py-3">Receive Date</th>
                    <th className="px-4 py-3">Qty Received</th>
                    <th className="px-4 py-3 text-right">Unit Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {product.purchaseHistory?.map((po, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{po.poNumber}</td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{po.supplier}</td>
                      <td className="px-4 py-3 text-slate-400">{po.orderDate}</td>
                      <td className="px-4 py-3 text-slate-400">{po.receiveDate}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{po.quantity} pcs</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">${po.unitCost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: SALES HISTORY */}
        {activeTab === "Sales History" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Customer Sales Order History
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">SO Ref</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Segment</th>
                    <th className="px-4 py-3">Sale Date</th>
                    <th className="px-4 py-3">Qty Sold</th>
                    <th className="px-4 py-3 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {product.salesHistory?.map((so, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{so.soNumber}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{so.customerName}</td>
                      <td className="px-4 py-3 text-slate-400">{so.customerType}</td>
                      <td className="px-4 py-3 text-slate-400">{so.saleDate}</td>
                      <td className="px-4 py-3 font-mono font-bold">{so.quantity} pcs</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">${so.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: WARRANTY */}
        {activeTab === "Warranty" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300">Warranty Protection Policy</span>
                <p className="text-lg font-black text-purple-600 dark:text-purple-400">{product.warranty}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>

            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              RMA Defect Log & Claims
            </h3>
            {product.warrantyLogs && product.warrantyLogs.length > 0 ? (
              <div className="space-y-2">
                {product.warrantyLogs.map((log, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{log.rmaNumber} - {log.customerName}</span>
                      <Badge variant="warning" size="sm">{log.resolution}</Badge>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">Issue: {log.defectType}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No RMA claims or defects reported for this SKU.</p>
            )}
          </div>
        )}

        {/* TAB 8: IMAGES */}
        {activeTab === "Images" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Product Image Gallery
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {product.images?.map((img) => (
                <div key={img.id} className="group relative rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <img src={img.url} alt={img.title} className="w-full h-32 object-cover group-hover:scale-105 transition" />
                  <div className="p-2 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {img.title} {img.isPrimary && "(Primary)"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: NOTES */}
        {activeTab === "Notes" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Technician & Audit Log Notes
            </h3>

            <div className="space-y-3">
              {product.notes?.map((note) => (
                <div key={note.id} className={clsx("p-3 rounded-xl border text-xs", note.isWarning ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200" : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700")}>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <span>{note.author} ({note.role})</span>
                    <span className="text-slate-400 font-normal">{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-slate-800 dark:text-slate-200">{note.content}</p>
                </div>
              ))}
            </div>

            {/* Add note input */}
            <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <input
                type="text"
                placeholder="Add technician handling note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                Post Note
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
