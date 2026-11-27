export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  created_at: string;
}

export interface CustomerCreateRequest {
  name: string;
  email: string;
  phone?: string | null;
}

export interface CustomerUpdateRequest {
  name: string;
  email: string;
  phone?: string | null;
}

export interface CustomerFilters {
  skip?: number;
  limit?: number;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
}

export interface CustomerManagementStats {
  total: number;
  withPhone: number;
  withoutPhone: number;
}

export type CustomerPhoneFilter =
  | "all"
  | "with_phone"
  | "without_phone";

export type CustomerTicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

export type CustomerTicketPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type CustomerTicketStatusFilter =
  | "all"
  | CustomerTicketStatus;

export interface CustomerTicket {
  id: number;
  subject: string;
  description?: string;
  status: CustomerTicketStatus;
  priority: CustomerTicketPriority;
  category?: string | null;
  customer_id?: number | null;
  assigned_agent_id?: number | null;
  created_at: string;
}

export interface CustomerTicketListResponse {
  item: CustomerTicket[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface CustomerTicketFilters {
  page?: number;
  limit?: number;
  status?: CustomerTicketStatus;
}

export interface CustomerDetailsData {
  customer: Customer;
  tickets: CustomerTicketListResponse;
}

export interface CustomerTicketStatistics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  active: number;
  completed: number;
}