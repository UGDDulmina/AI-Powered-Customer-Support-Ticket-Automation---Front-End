import {
  useState,
  useEffect,
  useRef,
} from "react";

import type { ReactNode } from "react";

import {
  login as loginRequest,
  getCurrentAgent,
  saveAccessToken,
  getAccessToken,
  removeAccessToken,
  updateMyProfile,
  changeMyPassword,
} from "../api/auth.api";

import type {
  AuthenticatedAgent,
  LoginRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
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
    useState(true);

  const sessionVersion = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const version = sessionVersion.current;

    const initializeAuth = async () => {
      try {
        const token = getAccessToken();

        if (!token) return;

        const currentUser =
          await getCurrentAgent();

        if (!currentUser.is_active) {
          throw new Error("Account is inactive");
        }

        if (
          !cancelled &&
          version === sessionVersion.current
        ) {
          setUser(currentUser);
        }
      } catch {
        if (
          !cancelled &&
          version === sessionVersion.current
        ) {
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

  const login = async (
    credentials: LoginRequest
  ): Promise<AuthenticatedAgent> => {
    const version = ++sessionVersion.current;

    try {
      removeAccessToken();
      setUser(null);

      const response =
        await loginRequest(credentials);

      if (version !== sessionVersion.current) {
        throw new Error("Login request cancelled.");
      }

      saveAccessToken(response.access_token);

      const currentUser =
        await getCurrentAgent();

      if (version !== sessionVersion.current) {
        throw new Error("Login request cancelled.");
      }

      if (!currentUser.is_active) {
        throw new Error("Account is inactive");
      }

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      if (version === sessionVersion.current) {
        removeAccessToken();
        setUser(null);
      }

      throw error;
    }
  };

  const logout = (): void => {
    sessionVersion.current++;
    removeAccessToken();
    setUser(null);
  };

  const updateProfile = async (
    payload: UpdateProfileRequest
  ): Promise<AuthenticatedAgent> => {
    if (!user) {
      throw new Error("Authentication required.");
    }

    const version = sessionVersion.current;

    const updatedUser =
      await updateMyProfile(payload);

    if (
      version !== sessionVersion.current ||
      updatedUser.id !== user.id
    ) {
      throw new Error("Account session has changed.");
    }

    setUser(updatedUser);

    return updatedUser;
  };

  const changePassword = async (
    payload: ChangePasswordRequest
  ): Promise<void> => {
    if (!user) {
      throw new Error("Authentication required.");
    }

    const version = sessionVersion.current;

    await changeMyPassword(payload);

    if (version === sessionVersion.current) {
      logout();
    }
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
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};