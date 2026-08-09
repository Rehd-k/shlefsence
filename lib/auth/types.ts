export type UserRole = "Admin" | "Manager" | "Supervisor" | "Sales";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedLocation: string;
  supervisedLocations?: string[];
  permissions?: {
    allowedPages: string[];
    allowAllLocations: boolean;
  };
}
