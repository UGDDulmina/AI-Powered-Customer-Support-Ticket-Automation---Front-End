import { createContext } from "react";

import type {
  AuthenticatedAgent,
  LoginRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
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

  updateProfile: (
    payload: UpdateProfileRequest
  ) => Promise<AuthenticatedAgent>;

  changePassword: (
    payload: ChangePasswordRequest
  ) => Promise<void>;

  logout: () => void;
}

export const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );