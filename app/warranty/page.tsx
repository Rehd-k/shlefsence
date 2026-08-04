"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Plus, CheckCircle2, XCircle, AlertCircle, RefreshCcw } from "lucide-react";

export default function WarrantyPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/warranty");
      const json = await res.json();
      if (json.success) setClaims(json.data);
    } catch (err) {
      console.error("Error loading warranty claims:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Warranty & RMA Claims
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage defective part returns, lab test inspections, and vendor chargebacks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
            onClick={fetchClaims}
          >
            Refresh
          </Button>

          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Log New RMA Claim
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">RMA Ref</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Part Item</th>
              <th className="px-4 py-3">Reported Defect</th>
              <th className="px-4 py-3">Logged Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {claims.map((claim) => (
              <tr key={claim.id || claim.claimId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {claim.claimId || claim.id}
                </td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{claim.customer}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold">{claim.part}</td>
                <td className="px-4 py-3 text-slate-400">{claim.issue}</td>
                <td className="px-4 py-3 text-slate-400">{claim.date}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={claim.status?.includes("Approved") ? "success" : claim.status?.includes("Rejected") ? "danger" : "warning"}
                    size="sm"
                  >
                    {claim.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
