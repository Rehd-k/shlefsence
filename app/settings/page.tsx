"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { useSettings } from "@/lib/context/SettingsContext";
import { useAuth } from "@/lib/context/AuthContext";
import { useLocation } from "@/lib/context/LocationContext";
import {
  Settings,
  Save,
  Shield,
  Database,
  Bell,
  Warehouse,
  Unlock,
  Lock,
  Check,
  AlertTriangle,
  UserCheck,
  Store,
  Building2,
  Users,
  Plus,
  Trash2,
  Edit2,
  Key,
  X,
} from "lucide-react";

interface RolePermissionData {
  role: string;
  allowedPages: string[];
  allowAllLocations: boolean;
}

const PAGE_KEYS = [
  { id: "dashboard", label: "Dashboard Metrics & Overview", desc: "View the overall ERP sales, inventory statistics, and financial charts." },
  { id: "crm", label: "Customer CRM", desc: "Access wholesale customer profiles, transaction history, and credit records." },
  { id: "products", label: "Products Catalog", desc: "Manage phone parts catalog, brand definitions, and barcode scanning." },
  { id: "inventory", label: "Inventory Stock Levels", desc: "Inspect bin/shelf configurations, edit stock counts, and log movements." },
  { id: "sales", label: "POS & Sales Checkout", desc: "Open the POS register interface, draft checkout receipts, and view daily sales." },
  { id: "purchase-orders", label: "Purchase Orders", desc: "Draft and execute POs, track Foxconn/Sunsky wholesale imports, and receive stock." },
  { id: "suppliers", label: "Suppliers Registry", desc: "View and edit details of overseas suppliers, catalog contracts, and log communications." },
  { id: "warehouses", label: "Locations & Warehouses", desc: "View physical floor maps, configure zones/bins, and manage inter-warehouse transfers." },
  { id: "warranty", label: "Warranty & RMA Claims", desc: "Inspect defective screens/batteries, track inspections, and issue refunds." },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [selectedRole, setSelectedRole] = useState("Manager");

  // Permissions state
  const [permissions, setPermissions] = useState<Record<string, RolePermissionData>>({
    Manager: { role: "Manager", allowedPages: [], allowAllLocations: true },
    Supervisor: { role: "Supervisor", allowedPages: [], allowAllLocations: false },
    Sales: { role: "Sales", allowedPages: [], allowAllLocations: false },
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { settings, updateSettings } = useSettings();
  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [currencyDefault, setCurrencyDefault] = useState("₦");

  // General settings state
  const [autoPo, setAutoPo] = useState(true);
  const [strictBin, setStrictBin] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (settings) {
      setBusinessName(settings.businessName || "");
      setBusinessPhone(settings.businessPhone || "");
      setBusinessAddress(settings.businessAddress || "");
      setCurrencyDefault(settings.currencyDefault || "₦");
    }
  }, [settings]);

  const triggerToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchPermissions = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/auth/permissions");
      const json = await res.json();
      if (json.success && json.data) {
        const loaded: Record<string, RolePermissionData> = {};
        json.data.forEach((p: any) => {
          loaded[p.role] = {
            role: p.role,
            allowedPages: p.allowedPages || [],
            allowAllLocations: p.allowAllLocations ?? false,
          };
        });

        // Merge with existing fallback states
        setPermissions((prev) => ({
          ...prev,
          ...loaded,
        }));
      }
    } catch (err: any) {
      triggerToast("Failed to fetch custom role permissions", "error");
    } finally {
      setFetching(false);
    }
  };

  const handlePermissionToggle = (pageId: string) => {
    setPermissions((prev) => {
      const roleData = prev[selectedRole];
      const alreadyHas = roleData.allowedPages.includes(pageId);
      const updatedPages = alreadyHas
        ? roleData.allowedPages.filter((id) => id !== pageId)
        : [...roleData.allowedPages, pageId];

      return {
        ...prev,
        [selectedRole]: {
          ...roleData,
          allowedPages: updatedPages,
        },
      };
    });
  };

  const handleLocationToggle = (val: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        allowAllLocations: val,
      },
    }));
  };

  const savePermissions = async () => {
    setLoading(true);
    try {
      const targetData = permissions[selectedRole];
      const res = await fetch("/api/auth/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetData),
      });
      const json = await res.json();
      if (json.success) {
        triggerToast(`Permissions for ${selectedRole} updated successfully!`);
      } else {
        triggerToast(json.error || "Failed to update permissions", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveGeneralSettings = async () => {
    setLoading(true);
    const success = await updateSettings({
      businessName,
      businessPhone,
      businessAddress,
      currencyDefault,
    });
    setLoading(false);
    if (success) {
      triggerToast("System configuration successfully saved!");
    } else {
      triggerToast("Failed to save system configuration.", "error");
    }
  };

  const { user: currentUser } = useAuth();
  const { availableLocations } = useLocation();

  // User Management State
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form states for add/edit user
  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uRole, setURole] = useState<"Admin" | "Manager" | "Supervisor" | "Sales">("Sales");
  const [uAssignedLocation, setUAssignedLocation] = useState("Main Hub - Lagos");
  const [uSupervisedLocations, setUSupervisedLocations] = useState<string[]>([]);
  const [uPhone, setUPhone] = useState("");
  const [uStatus, setUStatus] = useState<"Active" | "Inactive">("Active");

  useEffect(() => {
    if (activeTab === "users" && currentUser?.role === "Admin") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success && json.data) {
        setUsers(json.data);
      } else {
        triggerToast(json.error || "Failed to load users", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Error loading users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName || !uEmail || !uPassword) {
      triggerToast("Name, Email, and Password are required", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: uName,
          email: uEmail,
          password: uPassword,
          role: uRole,
          assignedLocation: uAssignedLocation,
          supervisedLocations: uRole === "Supervisor" ? uSupervisedLocations : [],
          phone: uPhone,
          status: uStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        triggerToast("User successfully created!");
        setShowAddModal(false);
        // Reset form
        setUName("");
        setUEmail("");
        setUPassword("");
        setURole("Sales");
        setUAssignedLocation("Main Hub - Lagos");
        setUSupervisedLocations([]);
        setUPhone("");
        setUStatus("Active");
        fetchUsers();
      } else {
        triggerToast(json.error || "Failed to create user", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Error creating user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUser.id,
          name: uName,
          email: uEmail,
          password: uPassword || undefined, // Only send if set
          role: uRole,
          assignedLocation: uAssignedLocation,
          supervisedLocations: uRole === "Supervisor" ? uSupervisedLocations : [],
          phone: uPhone,
          status: uStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        triggerToast("User updated successfully!");
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        triggerToast(json.error || "Failed to update user", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Error updating user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users?id=${userId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        triggerToast("User deleted successfully.");
        fetchUsers();
      } else {
        triggerToast(json.error || "Failed to delete user", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Error deleting user", "error");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setUName(user.name || "");
    setUEmail(user.email || "");
    setUPassword(""); // Empty for security / no change
    setURole(user.role || "Sales");
    setUAssignedLocation(user.assignedLocation || "Main Hub - Lagos");
    setUSupervisedLocations(user.supervisedLocations || []);
    setUPhone(user.phone || "");
    setUStatus(user.status || "Active");
    setShowEditModal(true);
  };

  const tabs = [
    { id: "general", label: "General Settings", icon: <Settings className="w-4 h-4" /> },
    { id: "access-control", label: "Access Control & RBAC", icon: <Shield className="w-4 h-4" /> },
  ];
  if (currentUser?.role === "Admin") {
    tabs.push({ id: "users", label: "User Management", icon: <Users className="w-4 h-4" /> });
  }

  const activeRoleData = permissions[selectedRole] || { role: selectedRole, allowedPages: [], allowAllLocations: false };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "Manager":
        return <UserCheck className="w-4 h-4 text-purple-500" />;
      case "Supervisor":
        return <Building2 className="w-4 h-4 text-amber-500" />;
      default:
        return <Store className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <AppLayout>
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-2xl border text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
          toastMessage.type === "success"
            ? "bg-slate-900 border-indigo-500 text-indigo-400 dark:bg-indigo-950/90 dark:text-white"
            : "bg-rose-950/90 border-rose-500 text-rose-300"
        }`}>
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            ERP System Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure automated reorder triggers, multi-currency defaults, and custom user role permissions.
          </p>
        </div>

        {activeTab === "general" && (
          <Button
            variant="primary"
            size="sm"
            onClick={saveGeneralSettings}
            icon={<Save className="w-4 h-4" />}
          >
            Save System Configuration
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />

        {activeTab === "general" && (
          <div className="max-w-3xl space-y-6">
            {/* Business Profile & Currency Defaults */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" /> Business Profile & Currency Defaults
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-850 dark:text-slate-200 focus:outline-none"
                    placeholder="e.g. ShelfSense Lagos"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-850 dark:text-slate-200 focus:outline-none"
                      placeholder="e.g. +234 (1) 555-0192"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Default Currency</label>
                    <select
                      value={currencyDefault}
                      onChange={(e) => setCurrencyDefault(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-850 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="₦">Naira (₦)</option>
                      <option value="$">US Dollar ($)</option>
                      <option value="€">Euro (€)</option>
                      <option value="£">Pound (£)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Business Address</label>
                  <textarea
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-850 dark:text-slate-200 focus:outline-none"
                    placeholder="e.g. 14 Logistics Way, Ikeja, Lagos"
                  />
                </div>
              </div>
            </div>

            {/* Automated Stock Controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-indigo-500" /> Automated Stock Controls
              </h3>
              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Auto PO Generation on Critical Low Stock</p>
                    <p className="text-slate-400">Draft POs automatically when stock drops below reorder point.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoPo}
                    onChange={(e) => setAutoPo(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer animate-press"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Strict Bin Level Reservation</p>
                    <p className="text-slate-400">Lock specific shelf bins upon sales order issue.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={strictBin}
                    onChange={(e) => setStrictBin(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer animate-press"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "access-control" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Roles selector sidebar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-2">
                Manage Role Permissions
              </span>

              {["Manager", "Supervisor", "Sales"].map((roleName) => (
                <button
                  key={roleName}
                  onClick={() => setSelectedRole(roleName)}
                  className={`w-full text-left px-3 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    selectedRole === roleName
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {getRoleIcon(roleName)}
                    <span>{roleName === "Sales" ? "Sales Staff" : roleName}</span>
                  </div>
                  <Check className={`w-3.5 h-3.5 ${selectedRole === roleName ? "opacity-100" : "opacity-0"}`} />
                </button>
              ))}

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-500 font-semibold space-y-1.5 mt-4">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Admin Security Notice</span>
                </div>
                <p className="leading-relaxed opacity-90">
                  The Admin role possesses bypass permissions and cannot be modified. These changes apply immediately to active sessions.
                </p>
              </div>
            </div>

            {/* Permissions Panel */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-6">
              {fetching ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 animate-spin text-white flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-slate-400">Loading custom role states...</span>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        {getRoleIcon(selectedRole)}
                        {selectedRole === "Sales" ? "Sales Staff" : selectedRole} Customization
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {selectedRole === "Manager" && "Default same access as Admin, except Access Control settings."}
                        {selectedRole === "Supervisor" && "Access to assigned warehouse and custom sections enabled below."}
                        {selectedRole === "Sales" && "Restricted to transaction checkout and sections enabled below."}
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={loading}
                      onClick={savePermissions}
                      icon={<Save className="w-4 h-4" />}
                    >
                      Save {selectedRole === "Sales" ? "Sales Staff" : selectedRole} Permissions
                    </Button>
                  </div>

                  {/* Multi-Warehouse Lock */}
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                        <Warehouse className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        Bypass Location Constraint
                      </h4>
                      <p className="text-[11px] text-slate-400 max-w-lg leading-relaxed">
                        If enabled, user can view and execute transactions across all warehouses. If disabled, they are strictly locked into their <b>assignedLocation</b> warehouse.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleLocationToggle(false)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          !activeRoleData.allowAllLocations
                            ? "bg-slate-900 text-white dark:bg-slate-800"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-850 dark:text-slate-400 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" /> Lock to Hub
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLocationToggle(true)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          activeRoleData.allowAllLocations
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-850 dark:text-slate-400 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Unlock className="w-3.5 h-3.5" /> All Locations
                      </button>
                    </div>
                  </div>

                  {/* Feature/Page grid */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                      Allow Access to Pages & Features
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {PAGE_KEYS.map((page) => {
                        const isChecked = activeRoleData.allowedPages.includes(page.id);
                        return (
                          <label
                            key={page.id}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                              isChecked
                                ? "bg-slate-50 border-slate-300 dark:bg-slate-850/30 dark:border-slate-700"
                                : "bg-white border-slate-100 hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800/80 dark:hover:border-slate-800"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handlePermissionToggle(page.id)}
                              className="mt-0.5 w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                            />
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                {page.label}
                              </p>
                              <p className="text-[11px] text-slate-400 leading-normal">
                                {page.desc}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && currentUser?.role === "Admin" && (
          <div className="space-y-6">
            {/* Header / Add User action bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" /> Active System Staff Users
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage registered staff user accounts, assign locations, reset passwords, and control status.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setUName("");
                  setUEmail("");
                  setUPassword("");
                  setURole("Sales");
                  setUAssignedLocation("Main Hub - Lagos");
                  setUSupervisedLocations([]);
                  setUPhone("");
                  setUStatus("Active");
                  setShowAddModal(true);
                }}
                icon={<Plus className="w-4 h-4" />}
              >
                Add Staff User
              </Button>
            </div>

            {/* Users List Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              {loadingUsers ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 animate-spin text-white flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-slate-400">Loading users...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No staff users found. Run database seeder or create one above.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-b border-slate-200/80 dark:border-slate-800 uppercase tracking-wider font-bold">
                        <th className="px-6 py-4">Name & Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Assigned Warehouse</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 uppercase">
                                {u.name ? u.name[0] : "U"}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                                <p className="text-slate-400 font-medium text-[11px]">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              u.role === "Admin" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                              u.role === "Manager" ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                              u.role === "Supervisor" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                              "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-750 dark:text-slate-300">
                            {u.assignedLocation}
                            {u.role === "Supervisor" && u.supervisedLocations?.length > 0 && (
                              <div className="text-[10px] text-slate-400 font-normal mt-0.5 max-w-[200px] truncate" title={u.supervisedLocations.join(", ")}>
                                Supervises: {u.supervisedLocations.join(", ")}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-medium">{u.phone || "—"}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-405"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                              {u.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(u)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="Edit User"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={u.id === currentUser?.id}
                                className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ${
                                  u.id === currentUser?.id ? "opacity-30 cursor-not-allowed" : ""
                                }`}
                                title={u.id === currentUser?.id ? "Cannot delete yourself" : "Delete User"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 transition-all">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-500" /> Create Staff Account
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  placeholder="e.g. Chukwuemeka Obi"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={uEmail}
                  onChange={(e) => setUEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  placeholder="e.g. name@shelfsense.ng"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={uPassword}
                  onChange={(e) => setUPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Role</label>
                  <select
                    value={uRole}
                    onChange={(e) => setURole(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-850 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Sales">Sales Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Assigned Location</label>
                  <select
                    value={uAssignedLocation}
                    onChange={(e) => setUAssignedLocation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-850 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="All Locations">All Locations</option>
                    {availableLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {uRole === "Supervisor" && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Supervised Warehouses</label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl max-h-32 overflow-y-auto space-y-1.5">
                    {availableLocations.map((loc) => {
                      const isChecked = uSupervisedLocations.includes(loc);
                      return (
                        <label key={loc} className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setUSupervisedLocations(uSupervisedLocations.filter((l) => l !== loc));
                              } else {
                                setUSupervisedLocations([...uSupervisedLocations, loc]);
                              }
                            }}
                            className="w-3.5 h-3.5 accent-indigo-650 rounded cursor-pointer"
                          />
                          <span>{loc}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={uPhone}
                    onChange={(e) => setUPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-850 dark:text-slate-200 focus:outline-none"
                    placeholder="e.g. +234..."
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={uStatus}
                    onChange={(e) => setUStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-850 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={loading}>
                  Save Staff User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 transition-all">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-indigo-500" /> Edit Staff Account
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={uEmail}
                  onChange={(e) => setUEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1">
                  Reset Password <span className="text-slate-450 font-normal">(Leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  value={uPassword}
                  onChange={(e) => setUPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Role</label>
                  <select
                    value={uRole}
                    onChange={(e) => setURole(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-850 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Sales">Sales Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Assigned Location</label>
                  <select
                    value={uAssignedLocation}
                    onChange={(e) => setUAssignedLocation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-850 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="All Locations">All Locations</option>
                    {availableLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {uRole === "Supervisor" && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Supervised Warehouses</label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl max-h-32 overflow-y-auto space-y-1.5">
                    {availableLocations.map((loc) => {
                      const isChecked = uSupervisedLocations.includes(loc);
                      return (
                        <label key={loc} className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setUSupervisedLocations(uSupervisedLocations.filter((l) => l !== loc));
                              } else {
                                setUSupervisedLocations([...uSupervisedLocations, loc]);
                              }
                            }}
                            className="w-3.5 h-3.5 accent-indigo-650 rounded cursor-pointer"
                          />
                          <span>{loc}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={uPhone}
                    onChange={(e) => setUPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-850 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={uStatus}
                    onChange={(e) => setUStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-850 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={loading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
