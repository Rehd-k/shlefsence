"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, UserRole } from "@/lib/context/AuthContext";
import { Package, Mail, Lock, User, Phone, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Sales");
  const [assignedLocation, setAssignedLocation] = useState("Main Hub - Lagos");
  const [phone, setPhone] = useState("");
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role, assignedLocation, phone }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        login(json.data);
        if (role === "Sales") {
          router.push("/sales");
        } else {
          router.push("/");
        }
      } else {
        setError(json.error || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/30">
            <Package className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Create Account</h1>
          <p className="text-xs text-slate-400">Join ShelfSense ERP for multi-hub phone parts distribution</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="font-bold uppercase tracking-wider text-slate-400 mb-1 block">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Chukwuemeka Obi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold uppercase tracking-wider text-slate-400 mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="user@shelfsense.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold uppercase tracking-wider text-slate-400 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-400 mb-1 block">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Sales">Sales Staff</option>
              </select>
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-400 mb-1 block">Assigned Location</label>
              <select
                value={assignedLocation}
                onChange={(e) => setAssignedLocation(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none"
              >
                <option value="Main Hub - Lagos">Main Hub - Lagos</option>
                <option value="Ikeja Shop Counter">Ikeja Shop Counter</option>
                <option value="Abuja Central Hub">Abuja Central Hub</option>
                <option value="Port Harcourt Depot">Port Harcourt Depot</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            fullWidth
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/20 text-xs tracking-wide"
          >
            Create Account & Continue <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
