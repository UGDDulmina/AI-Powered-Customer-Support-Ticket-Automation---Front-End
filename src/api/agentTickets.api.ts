import {
  getAdminTickets,
  getAdminTicketById,
} from "./adminTickets.api";

import type {
  AgentTicket,
  AgentTicketListResponse,
  AgentTicketQuery,
} from "../types/agentTicket.types";

export const getMyTickets = async (
  agentId: number,
  filters: AgentTicketQuery = {},
  signal?: AbortSignal
): Promise<AgentTicketListResponse> => {
  if (!Number.isSafeInteger(agentId) || agentId <= 0) {
    throw new Error("Invalid authenticated agent.");
  }

  const data = await getAdminTickets(
    {
      ...filters,
      assigned_agent_id: agentId,
    },
    signal
  );

  if (
    data.item.some(
      (ticket) => ticket.assigned_agent_id !== agentId
    )
  ) {
    throw new Error("Unauthorized ticket data received.");
  }

  return data;
};

export const getMyTicketById = async (
  ticketId: number,
  agentId: number,
  signal?: AbortSignal
): Promise<AgentTicket> => {
  if (
    !Number.isSafeInteger(ticketId) ||
    ticketId <= 0 ||
    !Number.isSafeInteger(agentId) ||
    agentId <= 0
  ) {
    throw new Error("Invalid ticket or agent.");
  }

  const ticket = await getAdminTicketById(
    ticketId,
    signal
  );

  if (ticket.assigned_agent_id !== agentId) {
    throw new Error(
      "You do not have permission to access this ticket."
    );
  }

  return ticket;
};