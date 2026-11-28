import { createContext } from "react";

import type {
  AuthenticatedCustomer,
  CustomerLoginRequest,
} from "../types/customerAuth.types";

export interface CustomerAuthContextType {
  customer: AuthenticatedCustomer | null;
  loading: boolean;
  error: string;
  isAuthenticated: boolean;

  login: (
    credentials: CustomerLoginRequest
  ) => Promise<AuthenticatedCustomer>;

  logout: () => void;

  refreshCustomer: () => Promise<void>;
}

export const CustomerAuthContext =
  createContext<CustomerAuthContextType | undefined>(
    undefined
  );