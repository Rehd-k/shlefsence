export const DEFAULT_ROLE_PERMISSIONS: Record<
  string,
  { allowedPages: string[]; allowAllLocations: boolean }
> = {
  Admin: {
    allowedPages: [
      "dashboard",
      "crm",
      "products",
      "inventory",
      "sales",
      "purchase-orders",
      "suppliers",
      "warehouses",
      "warranty",
      "settings",
    ],
    allowAllLocations: true,
  },
  Manager: {
    allowedPages: [
      "dashboard",
      "crm",
      "products",
      "inventory",
      "sales",
      "purchase-orders",
      "suppliers",
      "warehouses",
      "warranty",
    ],
    allowAllLocations: true,
  },
  Supervisor: {
    allowedPages: [
      "dashboard",
      "products",
      "inventory",
      "sales",
      "purchase-orders",
      "warehouses",
      "warranty",
    ],
    allowAllLocations: false,
  },
  Sales: {
    allowedPages: ["sales"],
    allowAllLocations: false,
  },
};

export function defaultPermissionsForRole(role: string) {
  return (
    DEFAULT_ROLE_PERMISSIONS[role] || {
      allowedPages: [] as string[],
      allowAllLocations: false,
    }
  );
}
