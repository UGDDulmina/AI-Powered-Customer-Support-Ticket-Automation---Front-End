import {
  useState,
  useEffect,
} from "react";

import type { ReactNode } from "react";

import {
  login as loginRequest,
  getCurrentAgent,
  saveAccessToken,
  getAccessToken,
  removeAccessToken,
} from "../api/auth.api";

import type {
  AuthenticatedAgent,
  LoginRequest,
} from "../types/auth.types";

import { AuthContext } from "./authContext";


interface AuthProviderProps {
  children: ReactNode;
}


export const AuthProvider = ({
  children,
}: AuthProviderProps) => {

  const [user, setUser] =
    useState<AuthenticatedAgent | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);


  // Restore authentication after page refresh
  useEffect(() => {

    let cancelled = false;

    const initializeAuth = async () => {

      try {

        const token = getAccessToken();

        if (!token) {
          return;
        }

        const currentUser =
          await getCurrentAgent();

        if (!currentUser.is_active) {
          throw new Error("Account is inactive");
        }

        if (!cancelled) {
          setUser(currentUser);
        }

      } catch {

        if (!cancelled) {
          removeAccessToken();
          setUser(null);
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }
    };

    void initializeAuth();

    return () => {
      cancelled = true;
    };

  }, []);


  // Login functionality
  const login = async (
    credentials: LoginRequest
  ): Promise<AuthenticatedAgent> => {

    try {

      removeAccessToken();
      setUser(null);

      const response =
        await loginRequest(credentials);

      saveAccessToken(response.access_token);

      const currentUser =
        await getCurrentAgent();

      if (!currentUser.is_active) {
        throw new Error("Account is inactive");
      }

      setUser(currentUser);

      return currentUser;

    } catch (error) {

      removeAccessToken();

      setUser(null);

      throw error;
    }
  };


  const logout = (): void => {

    removeAccessToken();

    setUser(null);
  };


  const isAuthenticated = user !== null;

  const isAdmin = user?.role === "admin";

  const isAgent = user?.role === "agent";


  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isAgent,
        login,
        logout,
      }}
    >

      {children}

    </AuthContext.Provider>

  );
};