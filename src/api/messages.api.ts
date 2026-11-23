
import { apiClient } from "./client";

export interface SupportMessage {
  id: number;
  ticket_id?: number;
  content?: string;
  message?: string;
  body?: string;
  sender_type?: string;
  sender_role?: string;
  sender_id?: number | null;
  created_at?: string;
}

type MessageListResponse =
  | SupportMessage[]
  | { items: SupportMessage[] };

export async function getTicketMessages(
  ticketId: number
): Promise<SupportMessage[]> {
  const response = await apiClient.get<MessageListResponse>(
    `/tickets/${ticketId}/messages`
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data.items)) {
    return response.data.items;
  }

  throw new Error("Unexpected message list response");
}

export async function createManualReply(
  ticketId: number,
  content: string
): Promise<SupportMessage> {
  const response = await apiClient.post<SupportMessage>(
    `/tickets/${ticketId}/messages`,
    {
      content,
      sender_type: "agent",
    }
  );

  return response.data;
}
