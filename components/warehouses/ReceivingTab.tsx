"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Truck, CheckCircle2, ArrowDownToLine, PackageCheck, Barcode } from "lucide-react";

interface ReceivingItem {
  sku: string;
  name: string;
  expectedQty: number;
  receivedQty: number;
  binCode?: string;
  status: "Pending" | "Putaway" | "Discrepancy";
}

interface ReceivingOrder {
  id: string;
  receiptNumber: string;
  supplierName: string;
  poNumber?: string;
  status: "Pending" | "In-Progress" | "Completed";
  receivedBy: string;
  items: ReceivingItem[];
}

interface ReceivingTabProps {
  orders: ReceivingOrder[];
  availableBins: { binCode: string }[];
  onRefresh: () => void;
  onOpenScanner?: () => void;
}

export const ReceivingTab: React.FC<ReceivingTabProps> = ({
  orders,
  availableBins,
  onRefresh,
  onOpenScanner,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<ReceivingOrder | null>(null);
  const [isPutawayModalOpen, setIsPutawayModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReceivingItem | null>(null);
  const [putawayBin, setPutawayBin] = useState("");
  const [putawayQty, setPutawayQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenPutaway = (order: ReceivingOrder, item: ReceivingItem) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setPutawayQty(item.expectedQty - item.receivedQty);
    setPutawayBin(availableBins[0]?.binCode || "ZA-R01-S2-B01");
    setIsPutawayModalOpen(true);
  };

  const handleConfirmPutaway = async () => {
    if (!selectedOrder || !selectedItem || !putawayBin) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/warehouses/operations/receiving", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrder.id,
          action: "PUTAWAY",
          sku: selectedItem.sku,
          quantity: putawayQty,
          binCode: putawayBin,
          performedBy: "Receiving Clerk",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsPutawayModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error("Putaway error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-500" /> Inbound Receiving & Putaway Dock
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Process incoming supplier shipments, verify physical quantities against Purchase Orders, and store in designated bins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Barcode className="w-4 h-4" />} onClick={onOpenScanner}>
            Scan Delivery Barcode
          </Button>
        </div>
      </div>

      {/* Receiving Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const completedCount = order.items.filter((i) => i.status === "Putaway").length;
          const pct = Math.round((completedCount / order.items.length) * 100);

          return (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                      {order.receiptNumber}
                    </span>
                    {order.poNumber && <Badge variant="neutral" size="sm">{order.poNumber}</Badge>}
                    <Badge
                      variant={order.status === "Completed" ? "success" : order.status === "In-Progress" ? "indigo" : "warning"}
                      size="sm"
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Supplier: <strong className="text-slate-900 dark:text-white">{order.supplierName}</strong> | Received by: {order.receivedBy}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block">Putaway Progress</span>
                    <span className="font-bold text-slate-900 dark:text-white">{pct}% ({completedCount}/{order.items.length} SKUs)</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{item.sku}</span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{item.name}</p>
                      {item.binCode && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                          Assigned Bin: {item.binCode}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Expected / Received</span>
                        <strong className="text-slate-900 dark:text-white">
                          {item.receivedQty} / {item.expectedQty} Units
                        </strong>
                      </div>

                      {item.status === "Putaway" ? (
                        <Badge variant="success" size="sm" className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Putaway Complete
                        </Badge>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<ArrowDownToLine className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenPutaway(order, item)}
                        >
                          Assign Putaway Bin
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center text-slate-400">
            <PackageCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No inbound receiving orders pending.</p>
          </div>
        )}
      </div>

      {/* Putaway Modal */}
      <Modal
        isOpen={isPutawayModalOpen}
        onClose={() => setIsPutawayModalOpen(false)}
        title={`Assign Putaway Bin: ${selectedItem?.sku || ""}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Confirm physical count received and select destination storage bin.
          </p>

          <Input
            label="Received Quantity"
            type="number"
            value={putawayQty}
            onChange={(e) => setPutawayQty(Number(e.target.value))}
          />

          <Select
            label="Destination Storage Bin"
            value={putawayBin}
            onChange={(e) => setPutawayBin(e.target.value)}
            options={availableBins.map((b) => ({ label: `Bin ${b.binCode}`, value: b.binCode }))}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsPutawayModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmPutaway} disabled={submitting}>
              {submitting ? "Saving..." : "Confirm Putaway"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
