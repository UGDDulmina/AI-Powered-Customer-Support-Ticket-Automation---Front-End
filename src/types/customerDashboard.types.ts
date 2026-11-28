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

export interface CustomerDashboardStatistics {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

export interface CustomerRecentTicket {
  id: number;
  subject: string;
  status: CustomerTicketStatus;
  priority: CustomerTicketPriority;
  category: string | null;
  created_at: string;
}

export interface CustomerDashboardData {
  statistics: CustomerDashboardStatistics;
  recent_tickets: CustomerRecentTicket[];
}

export const CUSTOMER_STATUS_LABELS: Record<
  CustomerTicketStatus,
  string
> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const CUSTOMER_STATUS_STYLES: Record<
  CustomerTicketStatus,
  string
> = {
  open: "bg-amber-100 text-amber-700",
  in_progress: "bg-purple-100 text-purple-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

export const CUSTOMER_PRIORITY_STYLES: Record<
  CustomerTicketPriority,
  string
> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};