"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { setCurrencySymbolCache } from "@/lib/utils/formatCurrency";

export interface IStoreSettings {
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  currencyDefault: string;
}

interface SettingsContextType {
  settings: IStoreSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<IStoreSettings>) => Promise<boolean>;
  formatPrice: (amount: number) => string;
  formatPriceCompact: (amount: number) => string;
}

const defaultSettings: IStoreSettings = {
  businessName: "ShelfSense Lagos",
  businessPhone: "+234 (1) 555-0192",
  businessAddress: "14 Logistics Way, Ikeja, Lagos",
  currencyDefault: "₦",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<IStoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings", { credentials: "include" });
      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
        setCurrencySymbolCache(json.data.currencyDefault || "₦");
        localStorage.setItem("shelfsense_settings", JSON.stringify(json.data));
      }
    } catch (err) {
      console.error("Error loading store settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<IStoreSettings>) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newSettings),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
        setCurrencySymbolCache(json.data.currencyDefault || "₦");
        localStorage.setItem("shelfsense_settings", JSON.stringify(json.data));
        return true;
      }
    } catch (err) {
      console.error("Error updating settings:", err);
    }
    return false;
  };

  const formatPrice = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return `${settings.currencyDefault}0.00`;
    }
    const locale = settings.currencyDefault === "₦" ? "en-NG" : "en-US";
    return `${settings.currencyDefault}${amount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPriceCompact = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return `${settings.currencyDefault}0`;
    }
    if (amount >= 1_000_000) {
      return `${settings.currencyDefault}${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      return `${settings.currencyDefault}${(amount / 1_000).toFixed(1)}k`;
    }
    return `${settings.currencyDefault}${amount.toFixed(0)}`;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        updateSettings,
        formatPrice,
        formatPriceCompact,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
