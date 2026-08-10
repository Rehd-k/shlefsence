"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, UserRole } from "@/lib/context/AuthContext";
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, Sparkles, Building2, Store } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "Sales") {
        router.push("/sales");
      } else {
        router.push("/");
      }
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (json.success && json.user) {
        login(json.user);
        // Redirect sales staff directly to sales/pos, others to dashboard
        if (json.user.role === "Sales") {
          router.push("/sales");
        } else {
          router.push("/");
        }
      } else {
        setError(json.error || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = async (role: UserRole, demoEmail: string, location: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: demoEmail, password: "Password123!" }),
      });
      const json = await res.json();

      if (json.success && json.user) {
        login(json.user);
        if (json.user.role === "Sales") {
          router.push("/sales");
        } else {
          router.push("/");
        }
      } else {
        setError(json.error || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <BrandLogo
            size="lg"
            surface="onDark"
            className="mx-auto rounded-2xl shadow-lg shadow-indigo-500/30"
          />
          <h1 className="text-2xl font-black tracking-tight text-white">ShelfSense ERP</h1>
          <p className="text-xs text-slate-400">Sign in to manage inventory, POS, and sales multi-hubs</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="user@shelfsense.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            fullWidth
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/20 text-xs tracking-wide"
          >
            Sign In to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {/* Role Quick Selector Demo */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block text-center">
            Quick Demo Sign-In (Click Role)
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => quickDemoLogin("Admin", "admin@shelfsense.ng", "All Locations")}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-indigo-950/50 border border-slate-700/80 hover:border-indigo-500 text-left transition"
            >
              <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin
              </div>
              <span className="text-[10px] text-slate-400 block">Full Control</span>
            </button>

            <button
              onClick={() => quickDemoLogin("Manager", "manager@shelfsense.ng", "Main Hub - Lagos")}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-purple-950/50 border border-slate-700/80 hover:border-purple-500 text-left transition"
            >
              <div className="flex items-center gap-1.5 font-bold text-purple-400">
                <UserCheck className="w-3.5 h-3.5" /> Manager
              </div>
              <span className="text-[10px] text-slate-400 block">Operations Lead</span>
            </button>

            <button
              onClick={() => quickDemoLogin("Supervisor", "supervisor@shelfsense.ng", "Main Hub - Lagos")}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-amber-950/50 border border-slate-700/80 hover:border-amber-500 text-left transition"
            >
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Building2 className="w-3.5 h-3.5" /> Supervisor
              </div>
              <span className="text-[10px] text-slate-400 block">Assigned Location</span>
            </button>

            <button
              onClick={() => quickDemoLogin("Sales", "sales@shelfsense.ng", "Ikeja Shop Counter")}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-emerald-950/50 border border-slate-700/80 hover:border-emerald-500 text-left transition"
            >
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <Store className="w-3.5 h-3.5" /> Sales (POS)
              </div>
              <span className="text-[10px] text-slate-400 block">POS & Invoices Only</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Need an account?{" "}
          <Link href="/register" className="text-indigo-400 font-bold hover:underline">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
}
