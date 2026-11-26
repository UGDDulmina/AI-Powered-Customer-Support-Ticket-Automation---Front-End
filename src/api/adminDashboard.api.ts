import { apiClient } from "./client";

import type {
  DashboardStatsResponse,
  SupportAgent,
  Customer,
  AgentWorkload,
  AgentStats,
  AdminDashboardData,
  RecentTicket,
  RecentTicketListResponse,
} from "../types/adminDashboard.types";


 

export const getTicketDashboardStats = async (
  signal?: AbortSignal
): Promise<DashboardStatsResponse> => {

  const response =
    await apiClient.get<DashboardStatsResponse>(
      "/stats/dashboard",
      { signal }
    );

  return response.data;
};


 

export const getDashboardAgents = async (
  signal?: AbortSignal
): Promise<SupportAgent[]> => {

  const response =
    await apiClient.get<SupportAgent[]>(
      "/agents",
      { signal }
    );

  return response.data;
};


 

export const calculateAgentStats = (
  accounts: SupportAgent[]
): AgentStats => {

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

    login_ready: agents.filter(
      (agent) =>
        agent.is_active &&
        agent.has_password
    ).length,
  };
};


 

export const getTotalCustomers = async (
  signal?: AbortSignal
): Promise<number> => {

  const pageSize = 100;

  let skip = 0;

  const customerIds = new Set<number>();

  while (true) {

    const response =
      await apiClient.get<Customer[]>(
        "/customers",
        {
          params: {
            skip,
            limit: pageSize,
          },
          signal,
        }
      );

    const customers = response.data;

    const previousSize = customerIds.size;

    customers.forEach((customer) => {
      customerIds.add(customer.id);
    });

    if (customers.length < pageSize) {
      break;
    }

    if (customerIds.size === previousSize) {
      throw new Error(
        "Customer pagination did not advance."
      );
    }

    skip += pageSize;
  }

  return customerIds.size;
};


 

export const getAgentWorkload = async (
  signal?: AbortSignal
): Promise<AgentWorkload[]> => {

  const response =
    await apiClient.get<AgentWorkload[]>(
      "/agents/workload",
      { signal }
    );

  return response.data;
};


 

export const getRecentTickets = async (
  signal?: AbortSignal
): Promise<RecentTicket[]> => {

  const response =
    await apiClient.get<RecentTicketListResponse>(
      "/tickets",
      {
        params: {
          page: 1,
          limit: 5,
        },
        signal,
      }
    );

  const tickets = response.data.item;

  if (!Array.isArray(tickets)) {
    throw new Error(
      "Invalid ticket list response."
    );
  }

  return [...tickets].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );
};


 

export const getAdminDashboardData = async (
  signal?: AbortSignal
): Promise<AdminDashboardData> => {

  const [
    tickets,
    accounts,
    totalCustomers,
    workload,
    recentTickets,
  ] = await Promise.all([
    getTicketDashboardStats(signal),
    getDashboardAgents(signal),
    getTotalCustomers(signal),
    getAgentWorkload(signal),
    getRecentTickets(signal),
  ]);


 

  const accountNames = new Map(
    accounts.map((account) => [
      account.id,
      account.name,
    ])
  );


 

  const agentIds = new Set(
    accounts
      .filter(
        (account) => account.role === "agent"
      )
      .map((account) => account.id)
  );


 

  const enrichedTickets = recentTickets.map(
    (ticket) => ({
      ...ticket,

      assigned_agent_name:
        ticket.assigned_agent_name ??
        (
          ticket.assigned_agent_id != null
            ? accountNames.get(
                ticket.assigned_agent_id
              ) ?? null
            : null
        ),
    })
  );


  return {
    tickets,

    agents: calculateAgentStats(accounts),

    totalCustomers,

    agentWorkload: workload.filter(
      (item) => agentIds.has(item.agent_id)
    ),

    recentTickets: enrichedTickets,
  };
};