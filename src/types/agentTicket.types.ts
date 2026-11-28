import type {
  AdminTicket,
  AdminTicketListResponse,
  TicketStatus,
  TicketPriority,
} from "./adminTicket.types";

export type AgentTicket = AdminTicket;

export type AgentTicketListResponse = AdminTicketListResponse;

export type AgentTicketStatusFilter = "all" | TicketStatus;

export type AgentTicketPriorityFilter = "all" | TicketPriority;

export interface AgentTicketFilters {
  search: string;
  status: AgentTicketStatusFilter;
  priority: AgentTicketPriorityFilter;
}

export interface AgentTicketQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
}