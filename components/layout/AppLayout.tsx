"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useLocation } from "@/lib/context/LocationContext";
import {
  Package,
  Layers,
  ShoppingBag,
  Truck,
  Building2,
  ShieldCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  Search,
  Bell,
  Warehouse,
  Menu,
  ChevronDown,
  Sparkles,
  LogOut,
  User as UserIcon,
  Users,
  X,
  LogIn,
} from "lucide-react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import { BrandLogo } from "@/components/brand/BrandLogo";

export interface AppLayoutProps {
  children: React.ReactNode;
  activeWarehouse?: string;
  onWarehouseChange?: (warehouse: string) => void;
  onQuickAction?: (actionKey: string) => void;
}

// WAREHOUSE_OPTIONS constant removed in favor of dynamic context locations

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeWarehouse = "Main Hub - Lagos",
  onWarehouseChange,
  onQuickAction,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, hasPermission } = useAuth();
  const { activeLocation, setActiveLocation, availableLocations } = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [warehouseDropdownOpen, setWarehouseDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Switch permissions
  const isSupervisorWithMultiple = user?.role === "Supervisor" && user.supervisedLocations && user.supervisedLocations.length > 1;
  const canSwitchLocations = user?.role === "Admin" || user?.role === "Manager" || (user?.permissions?.allowAllLocations ?? true) || isSupervisorWithMultiple;

  // Route protection redirect
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Generate switch options depending on role and supervisor assignments
  const getWarehouseOptions = () => {
    if (user?.role === "Admin" || user?.role === "Manager" || (user?.permissions?.allowAllLocations ?? true)) {
      return ["All Locations", ...availableLocations];
    }
    if (user?.role === "Supervisor") {
      const supervised = user.supervisedLocations || [];
      if (supervised.length === 0) {
        return [user.assignedLocation || "Main Hub - Lagos"];
      }
      return supervised;
    }
    // Sales staff locked to assigned location
    return [user?.assignedLocation || "Main Hub - Lagos"];
  };

  const warehouseOptions = getWarehouseOptions();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.shiftKey && e.key.toUpperCase() === "S") {
        e.preventDefault();
        onQuickAction?.("create-sale");
      } else if (e.shiftKey && e.key.toUpperCase() === "A") {
        e.preventDefault();
        onQuickAction?.("add-product");
      } else if (e.shiftKey && e.key.toUpperCase() === "P") {
        e.preventDefault();
        onQuickAction?.("create-po");
      } else if (e.shiftKey && e.key.toUpperCase() === "T") {
        e.preventDefault();
        onQuickAction?.("transfer-stock");
      } else if (e.shiftKey && e.key.toUpperCase() === "R") {
        e.preventDefault();
        onQuickAction?.("receive-shipment");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onQuickAction]);

  const handleWarehouseSelect = (wh: string) => {
    setActiveLocation(wh);
    if (onWarehouseChange) onWarehouseChange(wh);
    setWarehouseDropdownOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4">
        <BrandLogo
          size="lg"
          surface="onDark"
          className="rounded-2xl animate-pulse shadow-lg shadow-indigo-500/20"
        />
        <p className="text-xs text-slate-400 mt-4 animate-pulse">Syncing ERP Session...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect shortly
  }

  const allNavItems = [
    { name: "Dashboard", icon: BarChart3, href: "/", badge: "LIVE", key: "dashboard" },
    { name: "Customer CRM", icon: Users, href: "/crm", badge: "CRM", key: "crm" },
    { name: "Products", icon: Package, href: "/products", badge: "NEW", key: "products" },
    { name: "Inventory", icon: Layers, href: "/inventory", badge: "2.4k", key: "inventory" },
    { name: "POS & Sales", icon: ShoppingBag, href: "/sales", badge: "POS", key: "sales" },
    { name: "Purchase Orders", icon: ShoppingBag, href: "/purchase-orders", badge: "9", key: "purchase-orders" },
    { name: "Suppliers", icon: Truck, href: "/suppliers", key: "suppliers" },
    { name: "Locations & Hubs", icon: Building2, href: "/warehouses", key: "warehouses" },
    { name: "Warranty & RMA", icon: ShieldCheck, href: "/warranty", badge: "11", key: "warranty" },
    { name: "Settings", icon: Settings, href: "/settings", key: "settings" },
  ];

  // RBAC Filtering for Navigation Items
  const navItems = allNavItems.filter((item) => {
    return hasPermission(item.key);
  });

  const getPageKey = (path: string) => {
    if (path === "/") return "dashboard";
    const part = path.split("/")[1];
    return part;
  };

  const currentPageKey = getPageKey(pathname);
  const isAuthorized = hasPermission(currentPageKey);

  const getInitials = (name?: string) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const roleColor = {
    Admin: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    Manager: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    Supervisor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Sales: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  }[user?.role || "Admin"];

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside
        className={clsx(
          "fixed lg:sticky top-0 z-40 h-screen bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none",
          sidebarCollapsed ? "w-20" : "w-64",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <BrandLogo
              size="md"
              surface="onDark"
              className="shadow-lg shadow-indigo-500/20"
            />
            {!sidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                  ShelfSense
                  <span className="text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                    ERP
                  </span>
                </span>
                <span className="text-xs text-slate-400 font-medium truncate">Spare Parts & Wholesale</span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={clsx("w-4 h-4 transition-transform duration-300", sidebarCollapsed && "rotate-180")} />
          </button>
        </div>

        {/* Navigation Items (Rendered with Next.js Link) */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                )}
              >
                <Icon className={clsx("w-5 h-5 shrink-0 transition-transform group-hover:scale-105", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200")} />

                {!sidebarCollapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}

                {!sidebarCollapsed && item.badge && (
                  <Badge
                    variant={isActive ? "neutral" : "purple"}
                    size="sm"
                    className={clsx(isActive && "bg-white/20 text-white border-transparent")}
                  >
                    {item.badge}
                  </Badge>
                )}

                {/* Tooltip for collapsed sidebar */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* System Plan Banner */}
        {!sidebarCollapsed && (
          <div className="p-3 m-3 rounded-xl bg-linear-to-b from-slate-800/80 to-slate-800/40 border border-slate-700/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Multi-Hub Sync
              </span>
              <span className={clsx("text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border", roleColor)}>
                {user?.role || "Admin"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal truncate">
              {activeLocation || user?.assignedLocation || "Main Hub - Lagos"}
            </p>
          </div>
        )}

        {/* Footer User */}
        <div className="p-3 border-t border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 border border-indigo-400 flex items-center justify-center font-bold text-white shrink-0 text-sm shadow-sm">
            {getInitials(user?.name)}
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col truncate flex-1">
              <span className="text-xs font-semibold text-white truncate">{user?.name || "System User"}</span>
              <span className="text-[11px] text-slate-400 truncate">{user?.role || "Admin"}</span>
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between gap-4">
          {/* Mobile Menu Toggle & Warehouse Selector */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Warehouse Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => canSwitchLocations && setWarehouseDropdownOpen(!warehouseDropdownOpen)}
                disabled={!canSwitchLocations}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition",
                  canSwitchLocations ? "hover:bg-slate-200/80 cursor-pointer" : "opacity-80 cursor-not-allowed"
                )}
              >
                <Warehouse className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="max-w-40 sm:max-w-50 truncate">{activeLocation}</span>
                {canSwitchLocations && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              </button>

              {canSwitchLocations && warehouseDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 dark:bg-slate-900 dark:border-slate-800">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Location
                  </div>
                  {warehouseOptions.map((wh) => (
                    <button
                      key={wh}
                      type="button"
                      onClick={() => handleWarehouseSelect(wh)}
                      className={clsx(
                        "w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer",
                        activeLocation === wh
                          ? "text-indigo-600 font-bold bg-indigo-50/50 dark:bg-indigo-950/30 dark:text-indigo-400"
                          : "text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <span>{wh}</span>
                      {activeLocation === wh && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Global Search & Right Bar */}
          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative hidden md:flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Global SKU, Order #, Part Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 border border-slate-200/80 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:bg-slate-900"
              />
            </div>

            {/* Notification Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">ERP System Alerts</span>
                    <button type="button" onClick={() => setNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                      <p className="font-bold text-amber-900 dark:text-amber-300">7 Critical Low Stock Items</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">iPhone 15 Pro Max Screen stock under 5 units.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900">
                      <p className="font-bold text-indigo-900 dark:text-indigo-300">Shipment PO-8810 Received</p>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-400">150 units put away into Bin A1-S1-B01.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {getInitials(user?.name)}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 dark:bg-slate-900 dark:border-slate-800">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{user?.name || "System Admin"}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || "admin@shelfsense.ng"}</p>
                    <span className="inline-block text-[9px] uppercase font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                      Role: {user?.role || "Admin"}
                    </span>
                  </div>

                  <Link
                    href="/login"
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Switch User / Login
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      void logout().then(() => {
                        setUserDropdownOpen(false);
                        router.push("/login");
                      });
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN DISPLAY AREA */}
        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {isAuthorized ? (
            children
          ) : (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-xl mx-auto my-12 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-rose-500 via-purple-500 to-indigo-500" />
              
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-md">
                <ShieldCheck className="w-8 h-8 stroke-2" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Access Restricted
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mx-auto">
                  Your account is assigned the <span className="font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">{user.role}</span> role. You do not currently have administrative authorization to access the <span className="font-mono text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-semibold">{pathname}</span> page.
                </p>
              </div>

              <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Allowed Sections for your role
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {allNavItems
                    .filter((item) => hasPermission(item.key))
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/60 dark:bg-slate-800/40 dark:border-slate-800 dark:hover:bg-indigo-950/20 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition text-xs font-semibold"
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const allowed = allNavItems.find((item) => hasPermission(item.key));
                  router.push(allowed ? allowed.href : "/");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Go to Safe Zone
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
