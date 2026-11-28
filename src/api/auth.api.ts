import { apiClient } from "./client";

import type {
  LoginRequest,
  LoginResponse,
  AuthenticatedAgent,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "../types/auth.types";

const TOKEN_KEY = "access_token";

export const saveAccessToken = (
  token: string
): void => {
  sessionStorage.setItem(TOKEN_KEY, token);
};

export const getAccessToken = (): string | null => {
  return sessionStorage.getItem(TOKEN_KEY);
};

export const removeAccessToken = (): void => {
  sessionStorage.removeItem(TOKEN_KEY);
};

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    "/auth/login",
    credentials
  );

  return response.data;
};

export const loginAgent = login;

export const getCurrentAgent =
  async (): Promise<AuthenticatedAgent> => {
    const response =
      await apiClient.get<AuthenticatedAgent>(
        "/auth/me"
      );

    return response.data;
  };

export const updateMyProfile = async (
  payload: UpdateProfileRequest
): Promise<AuthenticatedAgent> => {
  const response =
    await apiClient.patch<AuthenticatedAgent>(
      "/auth/me",
      {
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        ...(payload.current_password !== undefined
          ? {
              current_password:
                payload.current_password,
            }
          : {}),
      }
    );

  return response.data;
};

export const changeMyPassword = async (
  payload: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  const response =
    await apiClient.patch<ChangePasswordResponse>(
      "/auth/change-password",
      payload
    );

  return response.data;
};

export const logout = (): void => {
  removeAccessToken();
};

export const isAuthenticated = (): boolean => {
  return Boolean(getAccessToken());
};