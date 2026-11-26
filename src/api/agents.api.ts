import { apiClient } from "./client";

import type {
  Agent,
  AgentRegistrationRequest,
  AgentRegistrationResponse,
  AgentUpdateRequest,
  AgentPasswordResetRequest,
  AgentFilters,
  AgentWorkload,
  AgentManagementStats,
} from "../types/agent.types";


export const getAgents = async (
  filters?: AgentFilters,
  signal?: AbortSignal
): Promise<Agent[]> => {

const response = await apiClient.get<Agent[]>(
    "/agents",
    {
      params: filters,
      signal,
    }
  );

  return response.data;
};


export const getSupportAgents = async (
  filters?: AgentFilters,
  signal?: AbortSignal
): Promise<Agent[]> => {

  const accounts = await getAgents(
    filters,
    signal
  );

  return accounts.filter(
    (account) => account.role === "agent"
  );
};


export const getAgentById = async (
  agentId: number,
  signal?: AbortSignal
): Promise<Agent> => {

  const response = await apiClient.get<Agent>(
    `/agents/${agentId}`,
    { signal }
  );

  return response.data;
};


export const registerAgent = async (
  payload: AgentRegistrationRequest
): Promise<AgentRegistrationResponse> => {

  const response =
    await apiClient.post<AgentRegistrationResponse>(
      "/agents/register",
      {
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        role: "agent",
      }
    );

  return response.data;
};

export const updateAgent = async (
  agentId: number,
  payload: AgentUpdateRequest
): Promise<Agent> => {

  const normalizedPayload: AgentUpdateRequest = {
    ...payload,
  };

  if (payload.name !== undefined) {
    normalizedPayload.name =
      payload.name.trim();
  }

  if (payload.email !== undefined) {
    normalizedPayload.email =
      payload.email.trim().toLowerCase();
  }

  const response = await apiClient.put<Agent>(
    `/agents/${agentId}`,
    normalizedPayload
  );

  return response.data;
};

export const activateAgent = async (
  agentId: number
): Promise<Agent> => {

  const response = await apiClient.patch<Agent>(
    `/agents/${agentId}/activate`
  );

  return response.data;
};

export const deactivateAgent = async (
  agentId: number
): Promise<Agent> => {

  const response = await apiClient.patch<Agent>(
    `/agents/${agentId}/deactivate`
  );

  return response.data;
};

export const resetAgentPassword = async (
  agentId: number,
  payload: AgentPasswordResetRequest
): Promise<Agent> => {

  const response = await apiClient.patch<Agent>(
    `/agents/${agentId}/reset-password`,
    payload
  );

  return response.data;
};


export const getAgentsWorkload = async (
  signal?: AbortSignal
): Promise<AgentWorkload[]> => {

  const response =
    await apiClient.get<AgentWorkload[]>(
      "/agents/workload",
      { signal }
    );

  return response.data;
};


export const calculateAgentManagementStats = (
  accounts: Agent[]
): AgentManagementStats => {

  const agents = accounts.filter(
    (account) => account.role === "agent"
  );

  return {
    total: agents.length,

    active: agents.filter(
      (agent) => agent.is_active
    ).length,

    inactive: agents.filter(
      (agent) => !agent.is_active
    ).length,

    loginReady: agents.filter(
      (agent) =>
        agent.is_active &&
        agent.has_password
    ).length,

    passwordRequired: agents.filter(
      (agent) => !agent.has_password
    ).length,
  };
};
