import type { UserRole } from "./auth.types";


export interface Agent {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  has_password: boolean;
  created_at: string;
}

export interface AgentRegistrationRequest {
  name: string;
  email: string;
  password: string;
  role: "agent";
}


export interface AgentRegistrationResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}


export interface AgentUpdateRequest {
  name?: string;
  email?: string;
  is_active?: boolean;
}


export interface AgentPasswordResetRequest {
  password: string;
}

export interface AgentFilters {
  is_active?: boolean;
}


export interface AgentWorkload {
  agent_id: number;
  agent_name: string;
  is_active: boolean;
  active_tickets: number;
}


export interface AgentManagementStats {
  total: number;
  active: number;
  inactive: number;
  loginReady: number;
  passwordRequired: number;
}


export interface AgentRegistrationFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AgentEditFormData {
  name: string;
  email: string;
}


export interface AgentPasswordResetFormData {
  password: string;
  confirmPassword: string;
}


export type AgentStatusFilter =
  | "all"
  | "active"
  | "inactive";