"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ClipboardList, CheckCircle2, AlertTriangle, RefreshCcw, FileSpreadsheet } from "lucide-react";

interface CycleCountBin {
  binCode: string;
  sku: string;
  productName: string;
  systemQty: number;
  countedQty?: number;
  variance?: number;
  reconciled: boolean;
}

interface CycleCountDoc {
  id: string;
  countId: string;
  title: string;
  zoneName: string;
  status: "Draft" | "In-Progress" | "Reconciled";
  counterName: string;
  bins: CycleCountBin[];
}

interface CycleCountTabProps {
  counts: CycleCountDoc[];
  onRefresh: () => void;
}

export const CycleCountTab: React.FC<CycleCountTabProps> = ({ counts, onRefresh }) => {
  const [selectedDoc, setSelectedDoc] = useState<CycleCountDoc | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBin, setEditingBin] = useState<CycleCountBin | null>(null);
  const [countedInput, setCountedInput] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenEditCount = (doc: CycleCountDoc, bin: CycleCountBin) => {
    setSelectedDoc(doc);
    setEditingBin(bin);
    setCountedInput(bin.countedQty !== undefined ? bin.countedQty : bin.systemQty);
    setIsEditModalOpen(true);
  };

  const handleSaveCount = async () => {
    if (!selectedDoc || !editingBin) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/warehouses/operations/cycle-count", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDoc.id,
          action: "UPDATE_COUNT",
          binCode: editingBin.binCode,
          countedQty: countedInput,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsEditModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error("Save count error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReconcileAll = async (doc: CycleCountDoc) => {
    if (!confirm(`Are you sure you want to reconcile inventory variances for ${doc.countId}? This will update official bin quantities and create audit movement logs.`)) {
      return;
    }

    try {
      const res = await fetch("/api/warehouses/operations/cycle-count", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: doc.id,
          action: "RECONCILE",
          performedBy: "Inventory Auditor",
        }),
      });

      const json = await res.json();
      if (json.success) {
        onRefresh();
      }
    } catch (err) {
      console.error("Reconcile error:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Physical Inventory Audit & Cycle Counts
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Perform scheduled physical stock counts, calculate system vs actual variances, and execute automated stock reconciliation.
          </p>
        </div>
      </div>

      {/* Cycle Count Sheets */}
      <div className="space-y-4">
        {counts.map((doc) => {
          const totalVariance = doc.bins.reduce((acc, b) => acc + (b.variance || 0), 0);

          return (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                      {doc.countId}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{doc.title}</h4>
                    <Badge variant={doc.status === "Reconciled" ? "success" : "warning"} size="sm">
                      {doc.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Target Area: <strong className="text-slate-900 dark:text-white">{doc.zoneName}</strong> | Lead Auditor: {doc.counterName}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block">Total Net Variance</span>
                    <span
                      className={`font-extrabold text-sm ${
                        totalVariance < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : totalVariance > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {totalVariance > 0 ? `+${totalVariance}` : totalVariance} Units
                    </span>
                  </div>

                  {doc.status !== "Reconciled" && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => handleReconcileAll(doc)}
                    >
                      Reconcile Audit
                    </Button>
                  )}
                </div>
              </div>

              {/* Bins Breakdown Table */}
              <div className="border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {doc.bins.map((bin, idx) => {
                  const hasCounted = bin.countedQty !== undefined;
                  const variance = bin.variance || 0;

                  return (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {bin.binCode}
                          </span>
                          <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold">
                            {bin.sku}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{bin.productName}</p>
                      </div>

                      <div className="flex items-center gap-5 text-xs w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">System Stock</span>
                          <strong className="text-slate-900 dark:text-white">{bin.systemQty}</strong>
                        </div>

                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">Counted</span>
                          <strong className="text-indigo-600 dark:text-indigo-400">
                            {hasCounted ? bin.countedQty : "--"}
                          </strong>
                        </div>

                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">Variance</span>
                          <span
                            className={`font-bold ${
                              variance < 0
                                ? "text-rose-600 dark:text-rose-400"
                                : variance > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-400"
                            }`}
                          >
                            {variance > 0 ? `+${variance}` : variance}
                          </span>
                        </div>

                        {doc.status !== "Reconciled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditCount(doc, bin)}
                          >
                            {hasCounted ? "Edit Count" : "Input Count"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {counts.length === 0 && (
          <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center text-slate-400">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No cycle count audits active.</p>
          </div>
        )}
      </div>

      {/* Edit Count Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Input Physical Count: ${editingBin?.binCode || ""}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
            <span className="text-slate-400 block">Target Item:</span>
            <strong className="text-slate-900 dark:text-white font-mono">{editingBin?.sku}</strong> - {editingBin?.productName}
            <div className="text-slate-400 pt-1">Current System Recorded Stock: {editingBin?.systemQty} Units</div>
          </div>

          <Input
            label="Actual Physical Counted Units"
            type="number"
            value={countedInput}
            onChange={(e) => setCountedInput(Number(e.target.value))}
            autoFocus
          />

          <div className="text-xs text-slate-500">
            Calculated Variance:{" "}
            <strong
              className={
                countedInput - (editingBin?.systemQty || 0) < 0
                  ? "text-rose-600"
                  : countedInput - (editingBin?.systemQty || 0) > 0
                  ? "text-emerald-600"
                  : "text-slate-700"
              }
            >
              {countedInput - (editingBin?.systemQty || 0) > 0
                ? `+${countedInput - (editingBin?.systemQty || 0)}`
                : countedInput - (editingBin?.systemQty || 0)} Units
            </strong>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveCount} disabled={submitting}>
              {submitting ? "Saving..." : "Save Physical Count"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
