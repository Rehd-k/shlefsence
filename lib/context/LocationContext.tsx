"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface LocationContextType {
  activeLocation: string;
  setActiveLocation: (location: string) => void;
  availableLocations: string[];
  refreshLocations: () => Promise<void>;
  loading: boolean;
}

const LocationContext = createContext<LocationContextType>({
  activeLocation: "All Locations",
  setActiveLocation: () => {},
  availableLocations: [],
  refreshLocations: async () => {},
  loading: true,
});

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeLocation, setActiveLocationState] = useState("All Locations");
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/warehouses");
      const json = await res.json();
      if (json.success && json.data) {
        const locNames = json.data.map((w: any) => w.name);
        setAvailableLocations(locNames);
        return locNames;
      }
    } catch (e) {
      console.error("Error loading warehouses in LocationContext:", e);
    }
    return [];
  };

  const refreshLocations = async () => {
    await fetchLocations();
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const locNames = await fetchLocations();
      
      const stored = localStorage.getItem("shelfsense_active_location");
      
      if (user) {
        const canSwitch = user.role === "Admin" || (user.permissions?.allowAllLocations ?? true);
        if (!canSwitch) {
          // Restricted user
          if (user.role === "Supervisor" && user.supervisedLocations && user.supervisedLocations.length > 0) {
            const supervised = user.supervisedLocations;
            if (stored && supervised.includes(stored)) {
              setActiveLocationState(stored);
            } else {
              setActiveLocationState(supervised[0]);
              localStorage.setItem("shelfsense_active_location", supervised[0]);
            }
          } else {
            setActiveLocationState(user.assignedLocation || "Main Hub - Lagos");
            localStorage.setItem("shelfsense_active_location", user.assignedLocation || "Main Hub - Lagos");
          }
        } else {
          // Admin/Manager: Allowed all locations
          if (stored && (stored === "All Locations" || stored === "All Warehouses" || locNames.includes(stored))) {
            setActiveLocationState(stored);
          } else {
            setActiveLocationState("All Locations");
            localStorage.setItem("shelfsense_active_location", "All Locations");
          }
        }
      }
      setLoading(false);
    };

    if (user) {
      init();
    }
  }, [user]);

  const setActiveLocation = (loc: string) => {
    setActiveLocationState(loc);
    localStorage.setItem("shelfsense_active_location", loc);
  };

  return (
    <LocationContext.Provider
      value={{
        activeLocation,
        setActiveLocation,
        availableLocations,
        refreshLocations,
        loading,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
