import { getAdminTickets } from "./adminTickets.api";

import type {
  AdminTicket,
} from "../types/adminTicket.types";

import type {
  AgentDashboardData,
  AgentDashboardStatistics,
  AgentTicketStatusDistribution,
  AgentTicketPriorityDistribution,
} from "../types/agentDashboard.types";

const PAGE_SIZE = 100;

export const getAgentAssignedTickets = async (
  agentId: number,
  signal?: AbortSignal
): Promise<AdminTicket[]> => {
  if (!Number.isSafeInteger(agentId) || agentId <= 0) {
    throw new Error("Invalid agent ID.");
  }

  const tickets = new Map<number, AdminTicket>();

  let page = 1;

  while (true) {
    const response = await getAdminTickets(
      {
        page,
        limit: PAGE_SIZE,
        assigned_agent_id: agentId,
      },
      signal
    );

    const previousSize = tickets.size;

    for (const ticket of response.item) {
      if (ticket.assigned_agent_id !== agentId) {
        throw new Error(
          "The server returned tickets outside the assigned agent scope."
        );
      }

      tickets.set(ticket.id, ticket);
    }

    if (!response.has_next) {
      break;
    }

    if (tickets.size === previousSize) {
      throw new Error(
        "Unable to retrieve the next page of assigned tickets."
      );
    }

    page += 1;
  }

  return Array.from(tickets.values());
};

export const calculateAgentDashboardData = (
  tickets: AdminTicket[]
): AgentDashboardData => {
  const statusDistribution: AgentTicketStatusDistribution = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  };

  const priorityDistribution: AgentTicketPriorityDistribution = {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  };

  for (const ticket of tickets) {
    statusDistribution[ticket.status] += 1;
    priorityDistribution[ticket.priority] += 1;
  }

  const total = tickets.length;

  const active =
    statusDistribution.open +
    statusDistribution.in_progress;

  const completed =
    statusDistribution.resolved +
    statusDistribution.closed;

  const completionRate =
    total > 0 ? (completed / total) * 100 : 0;

  const sortedTickets = [...tickets].sort(
    (first, second) =>
      new Date(second.created_at).getTime() -
      new Date(first.created_at).getTime() ||
      second.id - first.id
  );

  const activeUrgentTickets = sortedTickets.filter(
    (ticket) =>
      ticket.priority === "urgent" &&
      (
        ticket.status === "open" ||
        ticket.status === "in_progress"
      )
  );

  const statistics: AgentDashboardStatistics = {
    total,
    open: statusDistribution.open,
    inProgress: statusDistribution.in_progress,
    resolved: statusDistribution.resolved,
    closed: statusDistribution.closed,
    urgent: priorityDistribution.urgent,
    activeUrgent: activeUrgentTickets.length,
    active,
    completed,
    completionRate,
  };

  return {
    statistics,
    statusDistribution,
    priorityDistribution,
    recentTickets: sortedTickets.slice(0, 5),
    urgentTickets: activeUrgentTickets.slice(0, 5),
  };
};

export const getAgentDashboardData = async (
  agentId: number,
  signal?: AbortSignal
): Promise<AgentDashboardData> => {
  const tickets = await getAgentAssignedTickets(
    agentId,
    signal
  );

  return calculateAgentDashboardData(tickets);
};