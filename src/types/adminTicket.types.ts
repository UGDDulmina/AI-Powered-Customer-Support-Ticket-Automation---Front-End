export type TicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

export type TicketPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type TicketStatusFilter =
  | "all"
  | TicketStatus;

export interface AdminTicket {
  id: number;
  subject: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string | null;
  customer_id?: number | null;
  customer_name?: string | null;
  assigned_agent_id?: number | null;
  assigned_agent_name?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface AdminTicketListResponse {
  item: AdminTicket[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface AdminTicketQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  customer_id?: number;
  assigned_agent_id?: number;
}

export interface AdminTicketFilterState {
  search: string;
  status: TicketStatusFilter;
  customerId: string;
  agentId: string;
}

export interface AdminTicketStatistics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  urgent: number;
}

export interface TicketLookupOption {
  id: number;
  name: string;
  email: string;
}

export interface TicketAgentOption
  extends TicketLookupOption {
  is_active: boolean;
}

export interface AdminTicketLookups {
  customers: TicketLookupOption[];
  agents: TicketAgentOption[];
}

export interface AdminTicketCreateRequest {
  subject: string;
  description: string;
  customer_id: number;
  priority: TicketPriority;
  category?: string | null;
}

export interface AdminTicketCreateForm {
  customerId: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  category: string;
}

export interface TicketPredictionRequest {
  subject: string;
  description: string;
}

export interface TicketCategoryPrediction {
  category: string;
}

export interface TicketPriorityPrediction {
  priority: TicketPriority;
  matched_keywords: string[];
  reason: string;
}

export interface TicketPredictionResult {
  category: string;
  priority: TicketPriority;
  matchedKeywords: string[];
  reason: string;
}

export interface BackendTicketListResponse {
  items: AdminTicket[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}