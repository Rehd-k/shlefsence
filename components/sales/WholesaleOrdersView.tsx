"use client";

import React, { useState, useEffect } from "react";
import { IWholesaleCustomer } from "@/lib/types/sales";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Building2,
  CreditCard,
  Plus,
  Search,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { SEED_WHOLESALE_CUSTOMERS } from "@/lib/seed/salesSeedData";

interface WholesaleOrdersViewProps {
  onNewWholesaleOrder: () => void;
}

export const WholesaleOrdersView: React.FC<WholesaleOrdersViewProps> = ({ onNewWholesaleOrder }) => {
  const [customers, setCustomers] = useState<IWholesaleCustomer[]>(SEED_WHOLESALE_CUSTOMERS);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/sales/customers")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setCustomers(json.data);
      })
      .catch((err) => console.error("Error loading wholesale customers:", err));
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalCreditLimit = customers.reduce((a, b) => a + (b.creditLimit || 0), 0);
  const totalUsedCredit = customers.reduce((a, b) => a + (b.usedCredit || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top B2B Credit Line Health Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Revolving B2B Credit Facility</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              ${totalCreditLimit.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Across {customers.length} verified B2B accounts</p>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Drawn / Outstanding Credit</span>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              ${totalUsedCredit.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {totalCreditLimit > 0 ? ((totalUsedCredit / totalCreditLimit) * 100).toFixed(1) : 0}% credit utilization rate
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>B2B Wholesale Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              $240,086.00
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">70% of total company sales</p>
          </div>
        </Card>
      </div>

      {/* Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search B2B account name, tax ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={onNewWholesaleOrder}
        >
          New B2B Bulk Order
        </Button>
      </div>

      {/* Wholesale Accounts & Credit Lines Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3.5">Account & Company</th>
              <th className="px-4 py-3.5">Tier & Terms</th>
              <th className="px-4 py-3.5">Tax Exemption ID</th>
              <th className="px-4 py-3.5">Credit Line Utilization</th>
              <th className="px-4 py-3.5 text-right">Lifetime Spent</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredCustomers.map((cust) => {
              const limit = cust.creditLimit || 1;
              const utilPercent = Math.min(100, Math.round(((cust.usedCredit || 0) / limit) * 100));
              return (
                <tr key={cust.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{cust.name}</p>
                        <p className="text-[11px] text-slate-400">{cust.companyName} • {cust.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <Badge variant="purple" size="sm">
                        {cust.tier}
                      </Badge>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Terms: <strong className="text-slate-900 dark:text-white">{cust.paymentTerms}</strong>
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 font-mono text-[11px]">
                    {cust.taxExemptionId ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> {cust.taxExemptionId}
                      </span>
                    ) : (
                      <span className="text-slate-400">Standard Taxable</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="space-y-1 w-44">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          ${(cust.usedCredit || 0).toLocaleString()} used
                        </span>
                        <span className="text-slate-400">${(cust.creditLimit || 0).toLocaleString()} limit</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            utilPercent > 85 ? "bg-rose-500" : utilPercent > 50 ? "bg-amber-500" : "bg-indigo-500"
                          }`}
                          style={{ width: `${utilPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-right font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                    ${(cust.totalSpent || 0).toLocaleString()}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={onNewWholesaleOrder}>
                      Create Order
                    </Button>
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
