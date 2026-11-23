
import { apiClient } from "./client";

export interface Ticket {
  id: number;
  subject?: string;
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  customer_id?: number;
  assigned_agent_id?: number | null;
  created_at?: string;
  updated_at?: string | null;
}

type TicketListResponse =
  | Ticket[]
  | {
      items: Ticket[];
    };

export async function getTickets(): Promise<Ticket[]> {
  const response = await apiClient.get<TicketListResponse>(
    "/tickets"
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data.items)) {
    return response.data.items;
  }

  throw new Error("Unexpected ticket list response");
}

export async function getTicketById(
  ticketId: number
): Promise<Ticket> {
  const response = await apiClient.get<Ticket>(
    `/tickets/${ticketId}`
  );

  return response.data;
}

export async function updateTicketStatus(
  ticketId: number,
  status: string
): Promise<Ticket> {
  const response = await apiClient.patch<Ticket>(
    `/tickets/${ticketId}`,
    { status }
  );

  return response.data;
}
