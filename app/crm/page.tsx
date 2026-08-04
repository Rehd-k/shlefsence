"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Users,
  Building2,
  Search,
  Plus,
  Filter,
  DollarSign,
  Wallet,
  BadgeAlert,
  TrendingUp,
  LayoutGrid,
  List,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { ICustomer, CustomerType } from "@/lib/types/crm";
import { CustomerProfileModal } from "@/components/crm/CustomerProfileModal";
import { NewCustomerModal } from "@/components/crm/NewCustomerModal";

export default function CustomerCRMPage() {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal controls
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [newCustomerModalOpen, setNewCustomerModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [selectedType, sortBy]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedType && selectedType !== "All") params.append("customerType", selectedType);
      if (sortBy) params.append("sortBy", sortBy);

      const res = await fetch(`/api/crm/customers?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCustomers(json.data);
      }
    } catch (err) {
      console.error("Error loading CRM customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchCustomers();
    }
  };

  const handleCustomerCreated = (newCust: ICustomer) => {
    setCustomers((prev) => [newCust, ...prev]);
    setSelectedCustomer(newCust);
    setProfileModalOpen(true);
  };

  const handleCustomerUpdated = (updatedCust: ICustomer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCust.id ? updatedCust : c))
    );
  };

  // Filter local state search if typing continuously
  const filteredCustomers = customers.filter((cust) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      cust.businessName.toLowerCase().includes(q) ||
      cust.contactName.toLowerCase().includes(q) ||
      cust.email.toLowerCase().includes(q) ||
      cust.phone.toLowerCase().includes(q) ||
      cust.address?.city?.toLowerCase().includes(q)
    );
  });

  // Calculate CRM Top KPI Metrics
  const totalCustomers = customers.length;
  const totalDebt = customers.reduce((acc, c) => acc + (c.outstandingDebt || 0), 0);
  const totalWallet = customers.reduce((acc, c) => acc + (c.walletBalance || 0), 0);
  const repairShopsCount = customers.filter((c) => c.customerType === "Repair Shop").length;
  const retailCount = customers.filter((c) => c.customerType === "Retail").length;
  const distributorCount = customers.filter((c) => c.customerType === "Distributor").length;

  const getCustomerTypeBadge = (type: string) => {
    switch (type) {
      case "Repair Shop":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      case "Retail":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "Distributor":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 antialiased">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <Users className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Customer CRM
              </h1>
              <span className="text-xs uppercase font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                360° Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage Repair Shops, Retail Stores & Wholesale Distributors, track wallet balances, debt ledgers, RMA histories & communication timelines.
            </p>
          </div>

          <button
            onClick={() => setNewCustomerModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add New Customer
          </button>
        </div>

        {/* TOP CRM KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Accounts */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total CRM Accounts
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {totalCustomers}
              </p>
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 mt-1">
                <span className="text-indigo-600 font-bold">{repairShopsCount} Repair</span> •{" "}
                <span className="text-emerald-600 font-bold">{retailCount} Retail</span> •{" "}
                <span className="text-purple-600 font-bold">{distributorCount} Dist</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          {/* Total Outstanding Debt */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Outstanding CRM Debt
              </p>
              <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">
                ${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] font-medium text-rose-600/80 dark:text-rose-400/80 mt-1">
                Across Unpaid B2B Invoices
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <BadgeAlert className="w-6 h-6" />
            </div>
          </div>

          {/* Customer Wallet Balances */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Total Wallet Credit
              </p>
              <p className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 mt-1">
                ${totalWallet.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] font-medium text-indigo-600/80 dark:text-indigo-400/80 mt-1">
                Prepaid Store Credit Funds
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          {/* Account Types Distribution */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Distributors & Shops
              </p>
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                {distributorCount + repairShopsCount}
              </p>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                High-Volume B2B Partners
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* CONTROLS BAR: SEARCH, TYPE TABS, SORT & VIEW SWITCHER */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filter Pills for Customer Type */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["All", "Repair Shop", "Retail", "Distributor"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`py-1.5 px-3.5 rounded-xl font-bold text-xs transition whitespace-nowrap cursor-pointer ${
                  selectedType === type
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {type === "All" ? "All Customers" : type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search business, contact, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="newest">Recently Added</option>
              <option value="debt_desc">Highest Debt</option>
              <option value="wallet_desc">Highest Wallet</option>
              <option value="spent_desc">Highest Lifetime Revenue</option>
              <option value="name_asc">Name A-Z</option>
            </select>

            {/* Grid / Table View Switcher */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CUSTOMERS DISPLAY LIST */}
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold">Loading CRM Customer profiles...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Customers Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No customer profiles match your search criteria. Try clearing search query or click "Add New Customer".
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCustomers.map((cust) => {
              const debt = cust.outstandingDebt || 0;
              const wallet = cust.walletBalance || 0;
              const creditLimit = cust.creditLimit || 0;
              const creditUsagePct = creditLimit > 0 ? Math.min(100, Math.round((debt / creditLimit) * 100)) : 0;

              return (
                <div
                  key={cust.id}
                  onClick={() => {
                    setSelectedCustomer(cust);
                    setProfileModalOpen(true);
                  }}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-xl hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer"
                >
                  {/* Card Top */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl ${
                            cust.avatarColor || "bg-indigo-600"
                          } flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0`}
                        >
                          {cust.businessName.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="truncate">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {cust.businessName}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            Contact: {cust.contactName}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${getCustomerTypeBadge(
                          cust.customerType
                        )}`}
                      >
                        {cust.customerType}
                      </span>
                    </div>

                    {/* Contact Snippets */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.email}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{cust.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {cust.address?.city}, {cust.address?.state}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Ledger Indicators */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Debt Box */}
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 font-semibold block">Outstanding Debt</span>
                        <span
                          className={`font-bold ${
                            debt > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          ${debt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Wallet Box */}
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 font-semibold block">Store Wallet</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          ${wallet.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Credit Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                        <span>Credit Line Usage</span>
                        <span>${creditLimit.toLocaleString()} Limit</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${creditUsagePct}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition">
                      <span>View 360° Profile</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Business Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Phone / Location</th>
                  <th className="py-3 px-4 text-right">Outstanding Debt</th>
                  <th className="py-3 px-4 text-right">Wallet Credit</th>
                  <th className="py-3 px-4 text-right">Credit Limit</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredCustomers.map((cust) => {
                  const debt = cust.outstandingDebt || 0;
                  const wallet = cust.walletBalance || 0;
                  return (
                    <tr
                      key={cust.id}
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setProfileModalOpen(true);
                      }}
                      className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg ${
                              cust.avatarColor || "bg-indigo-600"
                            } flex items-center justify-center font-bold text-white text-xs shrink-0`}
                          >
                            {cust.businessName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{cust.businessName}</p>
                            <p className="text-[11px] text-slate-400">{cust.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCustomerTypeBadge(
                            cust.customerType
                          )}`}
                        >
                          {cust.customerType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {cust.contactName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <p>{cust.phone}</p>
                        <p className="text-[11px] text-slate-400">
                          {cust.address?.city}, {cust.address?.state}
                        </p>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          debt > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        ${debt.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                        ${wallet.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                        ${(cust.creditLimit || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(cust);
                            setProfileModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-[11px] transition cursor-pointer"
                        >
                          Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* MODALS */}
        <CustomerProfileModal
          customer={selectedCustomer}
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onCustomerUpdated={handleCustomerUpdated}
        />

        <NewCustomerModal
          isOpen={newCustomerModalOpen}
          onClose={() => setNewCustomerModalOpen(false)}
          onSuccess={handleCustomerCreated}
        />
      </div>
    </AppLayout>
  );
}
