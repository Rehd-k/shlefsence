"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, User, Plus, Building2, ShieldAlert } from "lucide-react";
import { clsx } from "clsx";

export interface ICustomerInfo {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  tier?: string;
  paymentTerms?: string;
}

interface CustomerSearchSelectProps {
  value: string; // Active selected customer ID or "WALK_IN"
  onChange: (customer: ICustomerInfo | null) => void;
  placeholder?: string;
}

export const CustomerSearchSelect: React.FC<CustomerSearchSelectProps> = ({
  value,
  onChange,
  placeholder = "Search customers by name, company, email...",
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ICustomerInfo[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomerInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initial load / sync when value changes
  useEffect(() => {
    if (value === "WALK_IN" || !value) {
      setSelectedCustomer(null);
      return;
    }

    // If a specific ID is selected, fetch it or find it
    if (value && (!selectedCustomer || selectedCustomer.id !== value)) {
      fetch(`/api/sales/customers?search=`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            const found = json.data.find((c: any) => c.id === value);
            if (found) {
              setSelectedCustomer({
                id: found.id,
                name: found.name,
                companyName: found.companyName,
                email: found.email,
                phone: found.phone,
                tier: found.tier,
                paymentTerms: found.paymentTerms,
              });
            }
          }
        })
        .catch((err) => console.error("Error loading selected customer:", err));
    }
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch results as query changes
  useEffect(() => {
    if (!dropdownOpen) return;

    setLoading(true);
    const delayDebounce = setTimeout(() => {
      fetch(`/api/sales/customers?search=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setResults(json.data);
          }
        })
        .catch((err) => console.error("Error searching customers:", err))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query, dropdownOpen]);

  const handleSelect = (customer: ICustomerInfo) => {
    setSelectedCustomer(customer);
    onChange(customer);
    setQuery("");
    setDropdownOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomer(null);
    onChange(null);
    setQuery("");
  };

  const handleCreateCustomer = async () => {
    if (!query.trim()) return;
    setLoading(true);

    const safeName = query.trim();
    const payload = {
      name: safeName,
      companyName: safeName,
      email: `${safeName.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
      phone: "+234 (0) 555-0100",
      tier: "Standard B2B",
      creditLimit: 500000,
      usedCredit: 0,
      availableCredit: 500000,
      paymentTerms: "Net 30",
    };

    try {
      const res = await fetch("/api/sales/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const createdCustomer: ICustomerInfo = {
          id: json.data.id || json.data._id,
          name: json.data.name,
          companyName: json.data.companyName,
          email: json.data.email,
          phone: json.data.phone,
          tier: json.data.tier,
          paymentTerms: json.data.paymentTerms,
        };
        handleSelect(createdCustomer);
      }
    } catch (err) {
      console.error("Failed to create customer on-the-fly:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {selectedCustomer ? (
        // Removable Pill UI
        <div className="flex items-center justify-between p-2 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedCustomer.name}
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono ml-2">
                ({selectedCustomer.tier || "Standard"} • {selectedCustomer.paymentTerms || "Net 30"})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Remove Customer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        // Search Input UI
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setDropdownOpen(true)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
          />

          {dropdownOpen && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 max-h-56 overflow-y-auto">
              <div className="p-1.5 space-y-1">
                {/* Walk-in Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    onChange(null);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>👤 Walk-in Retail Customer (Standard Retail Price)</span>
                </button>

                {/* Autocomplete list */}
                {results.map((cust) => (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => handleSelect(cust)}
                    className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{cust.name}</span>
                    </div>
                    {cust.tier && (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0">
                        {cust.tier}
                      </span>
                    )}
                  </button>
                ))}

                {/* Loader or Empty suggestions */}
                {loading && (
                  <div className="px-3 py-2 text-[10px] text-slate-400 italic">
                    Searching database records...
                  </div>
                )}

                {/* Create Custom Customer on-the-fly option */}
                {!loading && query.trim() !== "" && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1">
                    <button
                      type="button"
                      onClick={handleCreateCustomer}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create & select B2B Account: "{query.trim()}"</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
