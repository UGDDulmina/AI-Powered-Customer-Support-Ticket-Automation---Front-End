import type {
  AdminTicket,
  TicketStatus,
  TicketPriority,
} from "./adminTicket.types";

export interface AgentDashboardStatistics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  urgent: number;
  activeUrgent: number;
  active: number;
  completed: number;
  completionRate: number;
}

export type AgentTicketStatusDistribution =
  Record<TicketStatus, number>;

export type AgentTicketPriorityDistribution =
  Record<TicketPriority, number>;

export interface AgentDashboardData {
  statistics: AgentDashboardStatistics;
  statusDistribution: AgentTicketStatusDistribution;
  priorityDistribution: AgentTicketPriorityDistribution;
  recentTickets: AdminTicket[];
  urgentTickets: AdminTicket[];
}