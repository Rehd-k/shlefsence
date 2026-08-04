"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "Admin" | "Manager" | "Supervisor" | "Sales";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedLocation: string;
  permissions?: {
    allowedPages: string[];
    allowAllLocations: boolean;
  };
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (userData: UserSession) => void;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  hasPermission: (pageKey: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  hasRole: () => false,
  hasPermission: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPermissions = async (currentUser: UserSession) => {
      try {
        const res = await fetch(`/api/auth/permissions?role=${currentUser.role}`);
        const json = await res.json();
        if (json.success && json.data) {
          const updatedUser = {
            ...currentUser,
            permissions: {
              allowedPages: json.data.allowedPages,
              allowAllLocations: json.data.allowAllLocations,
            },
          };
          setUser(updatedUser);
          localStorage.setItem("shelfsense_user", JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.error("Failed to sync permissions:", err);
      }
    };

    try {
      const stored = localStorage.getItem("shelfsense_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        // Sync permissions with the DB in background
        fetchLatestPermissions(parsed);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: UserSession) => {
    setUser(userData);
    localStorage.setItem("shelfsense_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("shelfsense_user");
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
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
