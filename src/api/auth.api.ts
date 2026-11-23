
import { apiClient } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AgentProfile {
  id: number;
  name: string;
  email: string;
  role: "admin" | "agent";
  is_active: boolean;
}

export async function loginAgent(
  credentials: LoginRequest
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    "/auth/login",
    credentials
  );

  return response.data;
}

export async function getCurrentAgent(): Promise<AgentProfile> {
  const response = await apiClient.get<AgentProfile>(
    "/auth/me"
  );

  return response.data;
}
