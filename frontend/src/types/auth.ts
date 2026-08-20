export type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export type UserRole = "CUSTOMER" | "ORDER_STAFF" | "SHIPPER" | "ADMIN";

export interface AuthProfile {
  id: string;
  email: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
