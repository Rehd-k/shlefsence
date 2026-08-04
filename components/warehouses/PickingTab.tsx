"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, CheckCircle2, MapPin, Barcode, ArrowRight } from "lucide-react";

interface PickingItem {
  sku: string;
  name: string;
  binCode: string;
  requestedQty: number;
  pickedQty: number;
  status: "Pending" | "Picked" | "Shortage";
}

interface PickTicket {
  id: string;
  ticketNumber: string;
  orderId: string;
  customerName: string;
  status: "Pending" | "Picking" | "Completed";
  assignedPicker?: string;
  items: PickingItem[];
}

interface PickingTabProps {
  tickets: PickTicket[];
  onRefresh: () => void;
  onOpenScanner?: () => void;
}

export const PickingTab: React.FC<PickingTabProps> = ({ tickets, onRefresh, onOpenScanner }) => {
  const [loadingSku, setLoadingSku] = useState<string | null>(null);

  const handlePickItem = async (ticket: PickTicket, item: PickingItem) => {
    setLoadingSku(item.sku);
    try {
      const res = await fetch("/api/warehouses/operations/picking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ticket.id,
          sku: item.sku,
          pickedQty: item.requestedQty,
          performedBy: ticket.assignedPicker || "Picker",
        }),
      });

      const json = await res.json();
      if (json.success) {
        onRefresh();
      }
    } catch (err) {
      console.error("Pick error:", err);
    } finally {
      setLoadingSku(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" /> Digital Order Picking Lists
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Optimized pick path sequences ordered by Zone, Rack, and Bin location for fastest order fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Barcode className="w-4 h-4" />} onClick={onOpenScanner}>
            Scan Item Barcode
          </Button>
        </div>
      </div>

      {/* Pick Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket) => {
          const pickedCount = ticket.items.filter((i) => i.status === "Picked").length;
          const pct = Math.round((pickedCount / ticket.items.length) * 100);

          return (
            <div
              key={ticket.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                      {ticket.ticketNumber}
                    </span>
                    <Badge variant="neutral" size="sm">
                      Order #{ticket.orderId}
                    </Badge>
                    <Badge
                      variant={ticket.status === "Completed" ? "success" : ticket.status === "Picking" ? "warning" : "indigo"}
                      size="sm"
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Customer: <strong className="text-slate-900 dark:text-white">{ticket.customerName}</strong> | Picker: {ticket.assignedPicker}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="text-right">
                    <span className="text-slate-400 block">Fulfillment</span>
                    <strong className="text-slate-900 dark:text-white">{pct}% Picked ({pickedCount}/{ticket.items.length})</strong>
                  </div>
                </div>
              </div>

              {/* Items in Pick Sequence */}
              <div className="border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {ticket.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-mono text-xs font-bold flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                        P{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{item.sku}</span>
                          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Bin: {item.binCode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{item.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Required Qty</span>
                        <strong className="text-slate-900 dark:text-white">{item.requestedQty} Units</strong>
                      </div>

                      {item.status === "Picked" ? (
                        <Badge variant="success" size="sm" className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Picked
                        </Badge>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          onClick={() => handlePickItem(ticket, item)}
                          disabled={loadingSku === item.sku}
                        >
                          {loadingSku === item.sku ? "Updating..." : "Confirm Item Pick"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {tickets.length === 0 && (
          <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center text-slate-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No order pick tickets active.</p>
          </div>
        )}
      </div>
    </div>
  );
};
