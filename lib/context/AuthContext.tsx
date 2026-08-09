"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { UserRole, UserSession } from "@/lib/auth/types";

export type { UserRole, UserSession };

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (userData: UserSession) => void;
  logout: () => Promise<void>;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  hasPermission: (pageKey: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  hasRole: () => false,
  hasPermission: () => false,
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const json = await res.json();
      if (json.success && json.user) {
        setUser(json.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (cancelled) return;
        if (!res.ok) {
          setUser(null);
          return;
        }
        const json = await res.json();
        if (json.success && json.user) {
          setUser(json.user);
        } else {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = (userData: UserSession) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
  };

  const hasRole = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const hasPermission = (pageKey: string) => {
    if (!user) return false;
    if (user.role === "Admin") return true;
    if (!user.permissions) return false;
    return user.permissions.allowedPages.includes(pageKey);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, hasRole, hasPermission, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
