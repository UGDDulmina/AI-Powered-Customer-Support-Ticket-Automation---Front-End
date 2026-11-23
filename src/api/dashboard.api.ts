
import { apiClient } from "./client";
import type { Ticket } from "./tickets.api";

export interface TicketListResponse {
  item: Ticket[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  pending: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const allTickets: Ticket[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const response = await apiClient.get<TicketListResponse>(
      "/tickets",
      {
        params: { page, limit: 100 },
      }
    );

    const data = response.data;

    allTickets.push(...data.item);

    hasNext = data.has_next;
    page += 1;
  }

  const countByStatus = (status: string) =>
    allTickets.filter(
      (ticket) => ticket.status?.toLowerCase() === status
    ).length;

  return {
    total: allTickets.length,
    open: countByStatus("open"),
    inProgress: countByStatus("in_progress"),
    resolved: countByStatus("resolved"),
    closed: countByStatus("closed"),
    pending: countByStatus("pending"),
  };
}
