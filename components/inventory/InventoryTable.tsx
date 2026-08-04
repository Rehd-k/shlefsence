"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  flexRender,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
} from "lucide-react";
import { IInventoryItem, StockStatus, QualityGrade } from "@/lib/types/inventory";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface InventoryTableProps {
  data: IInventoryItem[];
  selectedRowIds: string[];
  onSelectRow: (id: string, isSelected: boolean) => void;
  onSelectAllRows: (isSelected: boolean) => void;
  onRowClick: (item: IInventoryItem) => void;
  isLoading?: boolean;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  data,
  selectedRowIds,
  onSelectRow,
  onSelectAllRows,
  onRowClick,
  isLoading = false,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(10);

  const isAllSelected = useMemo(() => {
    return data.length > 0 && data.every((item) => selectedRowIds.includes(item._id));
  }, [data, selectedRowIds]);

  const isSomeSelected = useMemo(() => {
    return data.some((item) => selectedRowIds.includes(item._id)) && !isAllSelected;
  }, [data, selectedRowIds, isAllSelected]);

  const columns = useMemo<ColumnDef<IInventoryItem>[]>(
    () => [
      // Select Checkbox Column
      {
        id: "select",
        header: () => (
          <Checkbox
            checked={isAllSelected}
            indeterminate={isSomeSelected}
            onChange={(e) => onSelectAllRows(e.target.checked)}
          />
        ),
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selectedRowIds.includes(row.original._id)}
              onChange={(e) => onSelectRow(row.original._id, e.target.checked)}
            />
          </div>
        ),
        enableSorting: false,
        size: 40,
      },

      // 1. SKU Column
      {
        accessorKey: "sku",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
          >
            SKU <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
              {row.original.sku}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">BC: {row.original.barcode}</span>
          </div>
        ),
      },

      // 2. Product Column
      {
        accessorKey: "product",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
          >
            Product <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const qualityBadge = {
            OEM_ORIGINAL: { label: "OEM Original", variant: "purple" as const },
            SERVICE_PACK: { label: "Service Pack", variant: "info" as const },
            REFURBISHED_A: { label: "Refurbished A", variant: "warning" as const },
            PREMIUM_AFTERMARKET: { label: "Aftermarket", variant: "neutral" as const },
          }[row.original.quality as QualityGrade] || { label: row.original.quality, variant: "neutral" as const };

          return (
            <div className="flex flex-col max-w-sm">
              <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {row.original.product}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={qualityBadge.variant} size="sm">
                  {qualityBadge.label}
                </Badge>
                <span className="text-[11px] text-slate-500 font-medium">
                  {row.original.category}
                </span>
              </div>
            </div>
          );
        },
      },

      // 3. Brand Column
      {
        accessorKey: "brand",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Brand <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">
            {row.original.brand}
          </span>
        ),
      },

      // 4. Phone Model Column
      {
        accessorKey: "phoneModel",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Model <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {row.original.phoneModel}
          </span>
        ),
      },

      // 5. Warehouse Column
      {
        accessorKey: "warehouse",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Warehouse <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate max-w-[140px] inline-block">
            {row.original.warehouse}
          </span>
        ),
      },

      // 6. Shelf Column
      {
        accessorKey: "shelf",
        header: "Shelf",
        cell: ({ row }) => (
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
            {row.original.shelf}
          </span>
        ),
      },

      // 7. Quantity Column
      {
        accessorKey: "quantity",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Qty <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isLow = row.original.quantity <= row.original.reorderPoint;
          return (
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <span className={isLow ? "text-amber-600 dark:text-amber-400 font-black" : "text-slate-900 dark:text-slate-100"}>
                {row.original.quantity}
              </span>
              {isLow && (
                <span title={`Reorder point: ${row.original.reorderPoint}`}>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                </span>
              )}
            </div>
          );
        },
      },

      // 8. Reserved Column
      {
        accessorKey: "reserved",
        header: "Reserved",
        cell: ({ row }) => (
          <span className="text-xs text-slate-500 font-medium">
            {row.original.reserved}
          </span>
        ),
      },

      // 9. Available Column
      {
        accessorKey: "available",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Avail <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const avail = row.original.available ?? Math.max(0, row.original.quantity - row.original.reserved);
          return (
            <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
              {avail}
            </span>
          );
        },
      },

      // 10. Cost Column ($)
      {
        accessorKey: "cost",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Cost <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-slate-600 font-medium">
            ${row.original.cost.toFixed(2)}
          </span>
        ),
      },

      // 11. Selling Price Column ($)
      {
        accessorKey: "sellingPrice",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Price <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
            ${row.original.sellingPrice.toFixed(2)}
          </span>
        ),
      },

      // 12. Status Column
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const statusConfig = {
            IN_STOCK: { label: "In Stock", variant: "success" as const },
            LOW_STOCK: { label: "Low Stock", variant: "warning" as const },
            OUT_OF_STOCK: { label: "Out of Stock", variant: "danger" as const },
            DEAD_STOCK: { label: "Dead Stock", variant: "neutral" as const },
            OVERSTOCKED: { label: "Overstocked", variant: "info" as const },
          }[row.original.status as StockStatus] || { label: row.original.status, variant: "neutral" as const };

          return (
            <Badge variant={statusConfig.variant} size="sm" dot>
              {statusConfig.label}
            </Badge>
          );
        },
      },
    ],
    [isAllSelected, isSomeSelected, selectedRowIds, onSelectAllRows, onSelectRow]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col dark:bg-slate-900 dark:border-slate-800">
      {/* Table Scrollable Container */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          {/* Sticky Header */}
          <thead className="bg-slate-50/90 dark:bg-slate-800/80 backdrop-blur-xs border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 select-none">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3.5 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium">Loading inventory stock records...</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Package className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      No Inventory Items Found
                    </h4>
                    <p className="text-xs text-slate-500">
                      Try clearing or adjusting your search filters to view matched stock items.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isSelected = selectedRowIds.includes(row.original._id);
                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick(row.original)}
                    className={`group transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3.5 py-3 align-middle text-xs">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {table.getState().pagination.pageIndex * pageSize + 1}
          </span>
          <span>to</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, data.length)}
          </span>
          <span>of</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{data.length}</span>
          <span>items</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span>Per page:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setPageSize(newSize);
                table.setPageSize(newSize);
              }}
              className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              {[10, 25, 50, 100].map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="xs"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              icon={<ChevronsLeft className="w-3.5 h-3.5" />}
            />
            <Button
              variant="outline"
              size="xs"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              icon={<ChevronLeft className="w-3.5 h-3.5" />}
            />
            <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              icon={<ChevronRight className="w-3.5 h-3.5" />}
            />
            <Button
              variant="outline"
              size="xs"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              icon={<ChevronsRight className="w-3.5 h-3.5" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
