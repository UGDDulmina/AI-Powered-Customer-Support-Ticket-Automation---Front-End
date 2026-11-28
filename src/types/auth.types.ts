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

export interface UpdateProfileRequest {
  name: string;
  email: string;
  current_password?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
  currentPassword: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}