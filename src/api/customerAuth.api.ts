import axios from "axios";

import type {
  AuthenticatedCustomer,
  CustomerRegisterRequest,
  CustomerLoginRequest,
  CustomerTokenResponse,
} from "../types/customerAuth.types";

const CUSTOMER_TOKEN_KEY = "customer_access_token";

export const CUSTOMER_SESSION_EXPIRED_EVENT =
  "customer-session-expired";

export const customerApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const saveCustomerToken = (token: string): void => {
  sessionStorage.setItem(CUSTOMER_TOKEN_KEY, token);
};

export const getCustomerToken = (): string | null => {
  return sessionStorage.getItem(CUSTOMER_TOKEN_KEY);
};

export const removeCustomerToken = (): void => {
  sessionStorage.removeItem(CUSTOMER_TOKEN_KEY);
};

export const isCustomerAuthenticated = (): boolean => {
  return Boolean(getCustomerToken());
};

customerApiClient.interceptors.request.use((config) => {
  const token = getCustomerToken();

  const isPublicEndpoint =
    config.url === "/customer-auth/register" ||
    config.url === "/customer-auth/login";

  if (token && !isPublicEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

customerApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      const currentToken = getCustomerToken();

      const requestAuthorization =
        error.config?.headers?.Authorization;

      if (
        currentToken &&
        requestAuthorization === `Bearer ${currentToken}`
      ) {
        removeCustomerToken();

        window.dispatchEvent(
          new Event(CUSTOMER_SESSION_EXPIRED_EVENT)
        );
      }
    }

    return Promise.reject(error);
  }
);

export const registerCustomer = async (
  payload: CustomerRegisterRequest
): Promise<AuthenticatedCustomer> => {
  const response =
    await customerApiClient.post<AuthenticatedCustomer>(
      "/customer-auth/register",
      {
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone?.trim() || null,
        password: payload.password,
      }
    );

  return response.data;
};

export const loginCustomer = async (
  payload: CustomerLoginRequest,
  signal?: AbortSignal
): Promise<CustomerTokenResponse> => {
  const response =
    await customerApiClient.post<CustomerTokenResponse>(
      "/customer-auth/login",
      {
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      },
      { signal }
    );

  return response.data;
};

export const getCurrentCustomer = async (
  signal?: AbortSignal
): Promise<AuthenticatedCustomer> => {
  const response =
    await customerApiClient.get<AuthenticatedCustomer>(
      "/customer-auth/me",
      { signal }
    );

  return response.data;
};

export const logoutCustomer = (): void => {
  removeCustomerToken();
};