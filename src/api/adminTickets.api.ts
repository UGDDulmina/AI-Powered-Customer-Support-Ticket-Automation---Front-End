import { apiClient } from "./client";
import { getAllCustomers } from "./customers.api";
import { getAgents } from "./agents.api";
import { getTicketDashboardStats } from "./adminDashboard.api";

import type {
  AdminTicketQuery,
  AdminTicketListResponse,
  AdminTicketStatistics,
  AdminTicketLookups,
  AdminTicket,
  AdminTicketCreateRequest,
  TicketPredictionRequest,
  TicketCategoryPrediction,
  TicketPriorityPrediction,
  TicketPredictionResult,
} from "../types/adminTicket.types";

export const getAdminTickets = async (
  filters: AdminTicketQuery = {},
  signal?: AbortSignal
): Promise<AdminTicketListResponse> => {
  const response =
    await apiClient.get<AdminTicketListResponse>(
      "/tickets",
      {
        params: {
          page: filters.page ?? 1,
          limit: filters.limit ?? 10,
          search: filters.search?.trim() || undefined,
          status: filters.status,
          customer_id: filters.customer_id,
          assigned_agent_id: filters.assigned_agent_id,
        },
        signal,
      }
    );

  if (
    !Array.isArray(response.data.item) ||
    !Number.isInteger(response.data.total) ||
    response.data.total < response.data.item.length
  ) {
    throw new Error("Invalid ticket list response.");
  }

  return response.data;
};

export const getAdminTicketById = async (
  ticketId: number,
  signal?: AbortSignal
): Promise<AdminTicket> => {
  const response = await apiClient.get<AdminTicket>(
    `/tickets/${ticketId}`,
    { signal }
  );

  return response.data;
};

export const getAdminTicketStatistics = async (
  signal?: AbortSignal
): Promise<AdminTicketStatistics> => {
  const data = await getTicketDashboardStats(signal);

  return {
    total: data.overview.total_tickets,
    open: data.by_status.open,
    inProgress: data.by_status.in_progress,
    resolved: data.by_status.resolved,
    closed: data.by_status.closed,
    urgent: data.by_priority.urgent,
  };
};

export const getAdminTicketLookups = async (
  signal?: AbortSignal
): Promise<AdminTicketLookups> => {
  const [customers, agents] = await Promise.all([
    getAllCustomers(signal),
    getAgents(undefined, signal),
  ]);

  return {
    customers: customers
      .map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),

    agents: agents
      .map((agent) => ({
        id: agent.id,
        name: agent.name,
        email: agent.email,
        is_active: agent.is_active,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
};

export const createAdminTicket = async (
  payload: AdminTicketCreateRequest
): Promise<AdminTicket> => {
  const response = await apiClient.post<AdminTicket>(
    "/tickets",
    {
      subject: payload.subject.trim(),
      description: payload.description.trim(),
      customer_id: payload.customer_id,
      priority: payload.priority,
      category: payload.category?.trim() || null,
    }
  );

  return response.data;
};

export const predictTicketCategory = async (
  payload: TicketPredictionRequest,
  signal?: AbortSignal
): Promise<TicketCategoryPrediction> => {
  const response =
    await apiClient.post<TicketCategoryPrediction>(
      "/tickets/tickets/categorize",
      {
        subject: payload.subject.trim(),
        description: payload.description.trim(),
      },
      { signal }
    );

  if (
    typeof response.data.category !== "string" ||
    !response.data.category.trim() ||
    response.data.category.trim().length > 50
  ) {
    throw new Error("Invalid category prediction response.");
  }

  return response.data;
};

export const predictTicketPriority = async (
  payload: TicketPredictionRequest,
  signal?: AbortSignal
): Promise<TicketPriorityPrediction> => {
  const response =
    await apiClient.post<TicketPriorityPrediction>(
      "/tickets/tickets/predict-priority",
      {
        subject: payload.subject.trim(),
        description: payload.description.trim(),
      },
      { signal }
    );

  const validPriorities = [
    "low",
    "medium",
    "high",
    "urgent",
  ];

  if (!validPriorities.includes(response.data.priority)) {
    throw new Error("Invalid priority prediction response.");
  }

  return response.data;
};

export const analyzeTicket = async (
  payload: TicketPredictionRequest,
  signal?: AbortSignal
): Promise<TicketPredictionResult> => {
  const [categoryResult, priorityResult] =
    await Promise.all([
      predictTicketCategory(payload, signal),
      predictTicketPriority(payload, signal),
    ]);

  return {
    category: categoryResult.category.trim(),
    priority: priorityResult.priority,
    matchedKeywords: Array.isArray(
      priorityResult.matched_keywords
    )
      ? priorityResult.matched_keywords
      : [],
    reason: priorityResult.reason || "",
  };
};