export type UserRole = "admin" | "agent";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AuthenticatedAgent {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}