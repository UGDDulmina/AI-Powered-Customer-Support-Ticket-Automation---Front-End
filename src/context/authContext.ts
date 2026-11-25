import { createContext } from "react";

import type {
  AuthenticatedAgent,
  LoginRequest,
} from "../types/auth.types";


export interface AuthContextType {
  user: AuthenticatedAgent | null;

  loading: boolean;

  isAuthenticated: boolean;

  isAdmin: boolean;

  isAgent: boolean;

  login: (
    credentials: LoginRequest
  ) => Promise<AuthenticatedAgent>;

  logout: () => void;
}


export const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );