"use client";

import React, { useState, useEffect } from "react";
import { IPOSCatalogItem, IPOSCartItem, PaymentMethod, IReceipt } from "@/lib/types/sales";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Zap,
  Plus,
  Minus,
  Trash2,
  Barcode,
  User,
  CreditCard,
  Banknote,
  Building2,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Percent,
  Layers,
  Grid,
  List,
} from "lucide-react";
import { clsx } from "clsx";
import { useSettings } from "@/lib/context/SettingsContext";
import { useAuth } from "@/lib/context/AuthContext";
import { CustomerSearchSelect, ICustomerInfo } from "./CustomerSearchSelect";

interface POSViewProps {
  onCompletePOSSale: (receipt: IReceipt) => void;
  activeLocation?: string;
}

export const POSView: React.FC<POSViewProps> = ({ onCompletePOSSale, activeLocation }) => {
  const [catalog, setCatalog] = useState<IPOSCatalogItem[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedQuality, setSelectedQuality] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Cart State
  const [cart, setCart] = useState<IPOSCartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("WALK_IN"); // "WALK_IN" or customer ID
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Credit Card");
  const [orderNotes, setOrderNotes] = useState("");
  const [cashTendered, setCashTendered] = useState<string>("");

  const { formatPrice, settings } = useSettings();
  const [customersList, setCustomersList] = useState<any[]>([]);

  const categories = ["ALL", "Screens", "Batteries", "Charging Ports", "Cameras", "Housing", "IC Chips"];
  const qualities = ["ALL", "OEM_ORIGINAL", "SERVICE_PACK", "PREMIUM_AFTERMARKET"];

  useEffect(() => {
    const query = activeLocation && activeLocation !== "All Locations" && activeLocation !== "All Warehouses"
      ? `?warehouse=${encodeURIComponent(activeLocation)}`
      : "";

    setCatalogError(null);
    fetch(`/api/sales/pos${query}`, { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setCatalog(json.data);
        } else {
          setCatalog([]);
          setCatalogError(json.error || "Failed to load POS catalog");
        }
      })
      .catch((err) => {
        setCatalog([]);
        setCatalogError(err instanceof Error ? err.message : "Failed to load POS catalog");
      });

    fetch("/api/sales/customers", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setCustomersList(json.data);
        }
      })
      .catch((err) => console.error("Error loading POS customers:", err));
  }, [activeLocation]);

  const handleCustomerChange = (customer: ICustomerInfo | null) => {
    if (!customer) {
      setSelectedCustomer("WALK_IN");
    } else {
      setSelectedCustomer(customer.id);
      setCustomersList((prev) => {
        const exists = prev.some((c) => c.id === customer.id || c._id === customer.id);
        if (!exists) {
          return [customer, ...prev];
        }
        return prev;
      });
    }
  };

  // Auto-apply tier pricing based on selected customer
  const isWholesaleCustomer = selectedCustomer !== "WALK_IN";
  const activeCustomerObj = customersList.find((c) => c.id === selectedCustomer || c._id === selectedCustomer);

  // Add item to cart
  const addToCart = (product: IPOSCatalogItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      const unitPrice = isWholesaleCustomer ? product.wholesalePrice : product.retailPrice;

      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                lineTotal: (item.quantity + 1) * unitPrice * (1 - item.discountPercentage / 100),
              }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            product,
            quantity: 1,
            unitPrice,
            discountPercentage: 0,
            lineTotal: unitPrice,
          },
        ];
      }
    });
  };

  // Modify cart item quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              lineTotal: newQty * item.unitPrice * (1 - item.discountPercentage / 100),
            };
          }
          return item;
        })
        .filter(Boolean) as IPOSCartItem[]
    );
  };

  // Modify item discount
  const updateDiscount = (productId: string, discount: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          const clampedDiscount = Math.min(100, Math.max(0, discount));
          return {
            ...item,
            discountPercentage: clampedDiscount,
            lineTotal: item.quantity * item.unitPrice * (1 - clampedDiscount / 100),
          };
        }
        return item;
      })
    );
  };

  // Remove cart item
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  // Recalculate cart totals
  const cartSubtotal = cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const cartDiscount = cart.reduce((acc, item) => acc + (item.quantity * item.unitPrice * item.discountPercentage) / 100, 0);
  const cartTax = isWholesaleCustomer ? 0 : (cartSubtotal - cartDiscount) * 0.08875; // NYC Sales tax for retail
  const cartTotal = cartSubtotal - cartDiscount + cartTax;

  const changeDue = paymentMethod === "Cash" && Number(cashTendered) > cartTotal ? Number(cashTendered) - cartTotal : 0;

  // Filter Catalog
  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      (item.barcode && item.barcode.includes(search));

    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesQuality = selectedQuality === "ALL" || item.quality === selectedQuality;

    return matchesSearch && matchesCategory && matchesQuality;
  });

  // Handle barcode scanning simulation
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) return;
    const match = catalog.find((item) => item.barcode === search || item.sku.toLowerCase() === search.toLowerCase());
    if (match) {
      addToCart(match);
      setSearch("");
    }
  };

  // Complete Checkout Handler
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setCheckoutError(null);
    const payload = {
      customerName: activeCustomerObj ? activeCustomerObj.name : "Walk-in Retail Customer",
      customerType: activeCustomerObj ? "Wholesale" : "POS Quick Sale",
      items: cart,
      totalAmount: cartTotal,
      paymentMethod,
      cashierName: user?.name || "Cashier",
    };

    try {
      const res = await fetch("/api/sales/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        onCompletePOSSale(json.data);
        setCart([]);
        setCashTendered("");
        setOrderNotes("");
      } else {
        setCheckoutError(json.error || "Checkout failed");
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-162.5">
      {/* LEFT PANE: PRODUCT CATALOG SEARCH & GRID (8 Cols) */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-4 h-full min-h-0">
        {(catalogError || checkoutError) && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {checkoutError || catalogError}
          </div>
        )}
        {/* Search & Barcode Scan Bar */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
            <Barcode className="absolute left-3.5 top-3 w-4 h-4 text-indigo-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Scan Barcode or Search SKU, Part Name (Press Enter to auto-add)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-mono"
            />
          </form>

          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={clsx(
                "p-1.5 rounded-lg transition cursor-pointer",
                viewMode === "grid" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs" : "text-slate-400"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={clsx(
                "p-1.5 rounded-lg transition cursor-pointer",
                viewMode === "list" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs" : "text-slate-400"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category & Quality Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={clsx(
                "px-3 py-1 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer",
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/80 dark:border-slate-800"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Items Display Area */}
        <div className="flex-1 overflow-y-auto pr-1">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredCatalog.map((prod) => {
                const currentPrice = isWholesaleCustomer ? prod.wholesalePrice : prod.retailPrice;
                return (
                  <div
                    key={prod.id}
                    onClick={() => addToCart(prod)}
                    className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer relative overflow-hidden"
                  >
                    <div>
                      <div className="relative h-24 w-full rounded-xl overflow-hidden mb-2 bg-slate-100 dark:bg-slate-800">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-1.5 right-1.5">
                          <Badge variant="purple" size="sm" className="text-[9px] py-0 px-1 font-mono">
                            {prod.quality.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="absolute bottom-1.5 left-1.5">
                          <span className="text-[10px] font-mono font-bold bg-slate-900/80 text-white px-1.5 py-0.5 rounded">
                            {prod.shelf}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-2">
                        {prod.name}
                      </h4>
                      <p className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {prod.sku}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono block">
                          {formatPrice(currentPrice)}
                        </span>
                        {isWholesaleCustomer && (
                          <span className="text-[10px] text-emerald-600 font-bold">
                            Save {formatPrice(prod.retailPrice - prod.wholesalePrice)}
                          </span>
                        )}
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Part Details</th>
                    <th className="px-3 py-2.5">Quality</th>
                    <th className="px-3 py-2.5">Stock</th>
                    <th className="px-3 py-2.5 text-right">Price</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCatalog.map((prod) => {
                    const currentPrice = isWholesaleCustomer ? prod.wholesalePrice : prod.retailPrice;
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <img src={prod.image} className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{prod.name}</p>
                              <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{prod.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge variant="neutral" size="sm">{prod.quality.replace("_", " ")}</Badge>
                        </td>
                        <td className="px-3 py-2.5 font-mono">{prod.stock} units</td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold">{formatPrice(currentPrice)}</td>
                        <td className="px-3 py-2.5 text-right">
                          <Button size="sm" variant="primary" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => addToCart(prod)}>
                            Add
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: LIVE CHECKOUT CART & CHECKOUT (4 Cols) */}
      <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg h-full min-h-0">
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          {/* Cart Header & Customer Picker */}
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
                  POS Speed Register
                </h3>
              </div>
              <Badge variant="purple" size="sm">{cart.length} Items</Badge>
            </div>

            {/* Customer Picker */}
            <div className="relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Select Customer Account
              </label>
              <CustomerSearchSelect
                value={selectedCustomer}
                onChange={handleCustomerChange}
              />
            </div>
          </div>

          {/* Cart Itemized List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <ShoppingBag className="w-10 h-10 stroke-[1.5] text-slate-300 dark:text-slate-700" />
                <p className="text-xs font-bold">Cart is empty</p>
                <p className="text-[11px] text-slate-400 max-w-50">
                  Click products on the left or scan barcode to add parts to cart.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img src={item.product.image} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{item.product.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>{formatPrice(item.unitPrice)} ea</span>
                        <span>•</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{item.product.sku}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Modifier */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-l-lg cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-r-lg cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-mono font-extrabold text-slate-900 dark:text-white w-24 text-right">
                      {formatPrice(item.lineTotal)}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Checkout Summary & Complete Sale Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
          {/* Payment Method Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["Credit Card", "Cash", "Bank Transfer"] as PaymentMethod[]).map((pm) => (
                <button
                  key={pm}
                  onClick={() => setPaymentMethod(pm)}
                  className={clsx(
                    "py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border",
                    paymentMethod === pm
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  )}
                >
                  {pm === "Credit Card" && <CreditCard className="w-3.5 h-3.5" />}
                  {pm === "Cash" && <Banknote className="w-3.5 h-3.5" />}
                  {pm === "Bank Transfer" && <Building2 className="w-3.5 h-3.5" />}
                  <span className="truncate">
                    {pm === "Credit Card" ? "Card" : pm === "Bank Transfer" ? "Transfer" : pm}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cash Tendered & Change Calculation */}
          {paymentMethod === "Cash" && (
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-300">Cash Tendered ({settings.currencyDefault}):</span>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="w-24 ml-2 px-2 py-0.5 text-xs bg-white dark:bg-slate-900 border border-amber-300 rounded font-mono font-bold"
                />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-amber-700 dark:text-amber-400 block">Change Due</span>
                <span className="font-mono font-extrabold text-amber-900 dark:text-amber-300 text-sm">
                  {formatPrice(changeDue)}
                </span>
              </div>
            </div>
          )}

          {/* Totals Summary */}
          <div className="space-y-1 text-xs font-mono bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>
            {cartDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount:</span>
                <span>-{formatPrice(cartDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Sales Tax ({isWholesaleCustomer ? "Exempt" : "7.5% VAT"}):</span>
              <span>{formatPrice(cartTax)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700">
              <span>Total Payable:</span>
              <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(cartTotal)}</span>
            </div>
          </div>

          {/* Complete Checkout Button */}
          <Button
            variant="primary"
            size="lg"
            disabled={cart.length === 0}
            icon={<CheckCircle2 className="w-5 h-5" />}
            onClick={handleCheckout}
            className="w-full bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3 rounded-xl shadow-lg shadow-emerald-600/20 text-sm tracking-wide"
          >
            Complete Sale & Issue Receipt ({formatPrice(cartTotal)})
          </Button>
        </div>
      </div>
    </div>
  );
};
