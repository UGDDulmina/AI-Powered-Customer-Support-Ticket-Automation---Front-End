import type {
  TicketStatus,
  TicketPriority,
} from "./adminTicket.types";

export interface TicketUpdateRequest {
  subject: string;
  description: string;
  category: string | null;
  priority: TicketPriority;
  status: TicketStatus;
}

export interface TicketEditForm {
  subject: string;
  description: string;
  category: string;
}

export interface TicketPriorityUpdateRequest {
  priority: TicketPriority;
}

export interface TicketStatusUpdateRequest {
  status: TicketStatus;
}

export type TicketManagementAction =
  | "edit"
  | "priority"
  | "status";

export interface TicketStatusOption {
  value: TicketStatus;
  label: string;
  description: string;
}

export interface TicketPriorityOption {
  value: TicketPriority;
  label: string;
  description: string;
}