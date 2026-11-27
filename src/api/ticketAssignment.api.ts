import { apiClient } from "./client";
import {
  getAgents,
  getAgentsWorkload,
} from "./agents.api";

import {
  getAdminTicketById,
} from "./adminTickets.api";

import type {
  AdminTicket,
} from "../types/adminTicket.types";

import type {
  TicketAssignmentRequest,
  TicketAssignmentData,
  AssignableAgent,
} from "../types/ticketAssignment.types";

export const getAssignableAgents = async (
  signal?: AbortSignal
): Promise<TicketAssignmentData> => {
  const [agents, workloadResult] = await Promise.all([
    getAgents(undefined, signal),
    getAgentsWorkload(signal)
      .then((data) => ({
        available: true,
        data,
      }))
      .catch((error: unknown) => {
        if (signal?.aborted) {
          throw error;
        }

        return {
          available: false,
          data: [],
        };
      }),
  ]);

  const workloadMap = new Map(
    workloadResult.data.map((item) => [
      item.agent_id,
      item.active_tickets,
    ])
  );

  const eligibleAgents: AssignableAgent[] = agents
    .filter(
      (agent) =>
        agent.role === "agent" &&
        agent.is_active &&
        agent.has_password
    )
    .map((agent) => ({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      is_active: agent.is_active,
      has_password: agent.has_password,
      activeTickets:
        workloadMap.get(agent.id) ?? null,
    }))
    .sort((a, b) => {
      const first =
        a.activeTickets ?? Number.MAX_SAFE_INTEGER;

      const second =
        b.activeTickets ?? Number.MAX_SAFE_INTEGER;

      return (
        first - second ||
        a.name.localeCompare(b.name)
      );
    });

  return {
    agents: eligibleAgents,
    workloadAvailable: workloadResult.available,
  };
};

export const assignTicketAgent = async (
  ticketId: number,
  payload: TicketAssignmentRequest
): Promise<void> => {
  await apiClient.patch(
    `/tickets/${ticketId}/assign`,
    {
      agent_id: payload.agent_id,
    }
  );
};

export const getTicketAssignmentDetails = async (
  ticketId: number,
  signal?: AbortSignal
): Promise<AdminTicket> => {
  return getAdminTicketById(ticketId, signal);
};