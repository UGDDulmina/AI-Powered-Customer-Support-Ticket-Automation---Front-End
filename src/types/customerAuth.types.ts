export interface AuthenticatedCustomer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  role: "customer";
}

export interface CustomerRegisterRequest {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
}

export interface CustomerLoginRequest {
  email: string;
  password: string;
}

export interface CustomerTokenResponse {
  access_token: string;
  token_type: string;
}

export interface CustomerRegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface CustomerLoginFormData {
  email: string;
  password: string;
}

export type CustomerRegisterFormErrors = Partial<
  Record<keyof CustomerRegisterFormData, string>
>;

export type CustomerLoginFormErrors = Partial<
  Record<keyof CustomerLoginFormData, string>
>;