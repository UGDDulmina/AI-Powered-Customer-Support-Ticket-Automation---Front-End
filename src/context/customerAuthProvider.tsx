import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";

import axios from "axios";

import {
  CustomerAuthContext,
} from "./customerAuthContext";

import type {
  AuthenticatedCustomer,
  CustomerLoginRequest,
} from "../types/customerAuth.types";

import {
  loginCustomer,
  getCurrentCustomer,
  getCustomerToken,
  saveCustomerToken,
  removeCustomerToken,
  CUSTOMER_SESSION_EXPIRED_EVENT,
} from "../api/customerAuth.api";

interface CustomerAuthProviderProps {
  children: ReactNode;
}

const isValidCustomer = (
  customer: AuthenticatedCustomer
): boolean => {
  return (
    customer.role === "customer" &&
    customer.is_active === true &&
    Number.isSafeInteger(customer.id) &&
    customer.id > 0
  );
};

export default function CustomerAuthProvider({
  children,
}: CustomerAuthProviderProps) {
  const [customer, setCustomer] =
    useState<AuthenticatedCustomer | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const sessionVersion = useRef(0);

  const requestController =
    useRef<AbortController | null>(null);

  const logout = useCallback(() => {
    sessionVersion.current += 1;

    requestController.current?.abort();
    requestController.current = null;

    removeCustomerToken();

    setCustomer(null);
    setError("");
    setLoading(false);
  }, []);

  const refreshCustomer = useCallback(async () => {
    requestController.current?.abort();

    const controller = new AbortController();

    requestController.current = controller;

    const version = ++sessionVersion.current;

    setLoading(true);
    setError("");

    const token = getCustomerToken();

    if (!token) {
      setCustomer(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await getCurrentCustomer(
        controller.signal
      );

      if (
        controller.signal.aborted ||
        version !== sessionVersion.current
      ) {
        return;
      }

      if (!isValidCustomer(profile)) {
        logout();
        return;
      }

      setCustomer(profile);
    } catch (requestError) {
      if (
        controller.signal.aborted ||
        version !== sessionVersion.current
      ) {
        return;
      }

      if (
        axios.isAxiosError(requestError) &&
        (
          requestError.response?.status === 401 ||
          requestError.response?.status === 403
        )
      ) {
        logout();
        return;
      }

      setCustomer(null);

      setError(
        "Unable to verify your customer session. Please try again."
      );
    } finally {
      if (
        !controller.signal.aborted &&
        version === sessionVersion.current
      ) {
        setLoading(false);
      }
    }
  }, [logout]);

  const login = useCallback(
    async (
      credentials: CustomerLoginRequest
    ): Promise<AuthenticatedCustomer> => {
      requestController.current?.abort();

      const controller = new AbortController();

      requestController.current = controller;

      const version = ++sessionVersion.current;

      setError("");
      setCustomer(null);

      removeCustomerToken();

      try {
        const response = await loginCustomer(
          credentials,
          controller.signal
        );

        if (
          controller.signal.aborted ||
          version !== sessionVersion.current
        ) {
          throw new Error(
            "Authentication request cancelled."
          );
        }

        if (
          typeof response.access_token !== "string" ||
          !response.access_token.trim() ||
          response.token_type?.toLowerCase() !== "bearer"
        ) {
          throw new Error(
            "Invalid authentication response."
          );
        }

        saveCustomerToken(response.access_token);

        const profile = await getCurrentCustomer(
          controller.signal
        );

        if (
          controller.signal.aborted ||
          version !== sessionVersion.current
        ) {
          throw new Error(
            "Authentication request cancelled."
          );
        }

        if (!isValidCustomer(profile)) {
          throw new Error(
            "Invalid customer account."
          );
        }

        setCustomer(profile);

        return profile;
      } catch (requestError) {
        if (version === sessionVersion.current) {
          removeCustomerToken();
          setCustomer(null);
        }

        throw requestError;
      } finally {
        if (version === sessionVersion.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
    };

    window.addEventListener(
      CUSTOMER_SESSION_EXPIRED_EVENT,
      handleSessionExpired
    );

    void refreshCustomer();

    return () => {
      sessionVersion.current += 1;

      requestController.current?.abort();

      window.removeEventListener(
        CUSTOMER_SESSION_EXPIRED_EVENT,
        handleSessionExpired
      );
    };
  }, [logout, refreshCustomer]);

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        loading,
        error,
        isAuthenticated: Boolean(customer),
        login,
        logout,
        refreshCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}