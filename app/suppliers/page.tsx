"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { SupplierKPIHeader } from "@/components/suppliers/SupplierKPIHeader";
import { SupplierAnalyticsDashboard } from "@/components/suppliers/SupplierAnalyticsDashboard";
import { SupplierDirectoryTable } from "@/components/suppliers/SupplierDirectoryTable";
import { SupplierProfileModal } from "@/components/suppliers/SupplierProfileModal";
import { AddSupplierModal } from "@/components/suppliers/AddSupplierModal";
import { LogCommunicationModal } from "@/components/suppliers/LogCommunicationModal";
import { AttachDocumentModal } from "@/components/suppliers/AttachDocumentModal";
import { AddContactModal } from "@/components/suppliers/AddContactModal";
import { ISupplier, ISupplierKPIs } from "@/lib/types/supplier";
import {
  Truck,
  Plus,
  RefreshCcw,
  BarChart2,
  Table as TableIcon,
  Sparkles,
  Database,
} from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [kpis, setKpis] = useState<ISupplierKPIs>({
    totalPurchases: 0,
    outstandingBalance: 0,
    averageDeliveryTime: 4.2,
    defectiveRate: 0.8,
    activeSuppliersCount: 0,
    totalSuppliersCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"directory" | "analytics">("directory");

  // Modals
  const [selectedSupplier, setSelectedSupplier] = useState<ISupplier | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isLogCommOpen, setIsLogCommOpen] = useState(false);
  const [isAttachDocOpen, setIsAttachDocOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suppliers");
      const json = await res.json();
      if (json.success) {
        setSuppliers(json.data);
        if (json.kpis) {
          setKpis(json.kpis);
        }
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seed?force=true", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        await fetchSuppliers();
      }
    } catch (err) {
      console.error("Error seeding database:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleSupplierDetails = async (supplierId: string) => {
    try {
      const res = await fetch(`/api/suppliers/${supplierId}`);
      const json = await res.json();
      if (json.success) {
        setSelectedSupplier(json.data);
      }
    } catch (err) {
      console.error("Error fetching single supplier details:", err);
    }
  };

  const handleOpenProfile = async (supplier: ISupplier) => {
    setSelectedSupplier(supplier);
    setIsProfileOpen(true);
    if (supplier.id || supplier._id) {
      await fetchSingleSupplierDetails((supplier.id || supplier._id)!);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header & Page Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <Truck className="w-7 h-7 text-indigo-600 dark:text-indigo-400 stroke-[2.2]" />
                Supplier CRM & Partner Portal
              </h1>
              <span className="text-xs uppercase font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                ERP 3.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Global manufacturer directory, procurement payables, lead time compliance, defect tracking, and communication logs.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle Switch */}
            <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-300/60 dark:border-slate-700">
              <button
                onClick={() => setViewMode("directory")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "directory"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                Directory
              </button>
              <button
                onClick={() => setViewMode("analytics")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "analytics"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Analytics
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
              onClick={fetchSuppliers}
              title="Refresh Supplier Dataset"
            >
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<Database className="w-3.5 h-3.5 text-indigo-500" />}
              onClick={handleSeedDatabase}
              title="Reset & Re-seed Supplier DB"
            >
              Seed DB
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddSupplierOpen(true)}
            >
              Add New Supplier
            </Button>
          </div>
        </div>

        {/* Executive KPI Bar */}
        <SupplierKPIHeader kpis={kpis} loading={loading} />

        {/* Main Content Area: Directory vs Analytics */}
        {viewMode === "directory" ? (
          <SupplierDirectoryTable
            suppliers={suppliers}
            loading={loading}
            onSelectSupplier={handleOpenProfile}
            onLogCommunication={(sup) => {
              setSelectedSupplier(sup);
              setIsLogCommOpen(true);
            }}
            onAttachDocument={(sup) => {
              setSelectedSupplier(sup);
              setIsAttachDocOpen(true);
            }}
          />
        ) : (
          <SupplierAnalyticsDashboard
            suppliers={suppliers}
            onSelectSupplier={handleOpenProfile}
          />
        )}

        {/* Supplier Profile Modal */}
        <SupplierProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          supplier={selectedSupplier}
          onLogCommunication={(sup) => {
            setSelectedSupplier(sup);
            setIsLogCommOpen(true);
          }}
          onAttachDocument={(sup) => {
            setSelectedSupplier(sup);
            setIsAttachDocOpen(true);
          }}
          onAddContact={(sup) => {
            setSelectedSupplier(sup);
            setIsAddContactOpen(true);
          }}
        />

        {/* Add Supplier Modal */}
        <AddSupplierModal
          isOpen={isAddSupplierOpen}
          onClose={() => setIsAddSupplierOpen(false)}
          onSupplierCreated={fetchSuppliers}
        />

        {/* Log Communication Modal */}
        <LogCommunicationModal
          isOpen={isLogCommOpen}
          onClose={() => setIsLogCommOpen(false)}
          supplier={selectedSupplier}
          onLogged={() => {
            fetchSuppliers();
            if (selectedSupplier) {
              fetchSingleSupplierDetails((selectedSupplier.id || selectedSupplier._id)!);
            }
          }}
        />

        {/* Attach Document Modal */}
        <AttachDocumentModal
          isOpen={isAttachDocOpen}
          onClose={() => setIsAttachDocOpen(false)}
          supplier={selectedSupplier}
          onAttached={() => {
            fetchSuppliers();
            if (selectedSupplier) {
              fetchSingleSupplierDetails((selectedSupplier.id || selectedSupplier._id)!);
            }
          }}
        />

        {/* Add Contact Modal */}
        <AddContactModal
          isOpen={isAddContactOpen}
          onClose={() => setIsAddContactOpen(false)}
          supplier={selectedSupplier}
          onContactAdded={() => {
            fetchSuppliers();
            if (selectedSupplier) {
              fetchSingleSupplierDetails((selectedSupplier.id || selectedSupplier._id)!);
            }
          }}
        />
      </div>
    </AppLayout>
  );
}
