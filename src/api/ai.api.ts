
import { apiClient } from "./client";

export interface AISuggestion {
  id: number;
  ticket_id: number;
  suggested_reply: string;
  edited_reply: string | null;
  status: string;
  created_at: string;
}

export interface GenerateSuggestionResponse {
  id: number;
  status: string;
  ticket_id: number;
  subject: string;
  suggested_reply: string;
}

export interface ReviewSuggestionResponse {
  id: number;
  ticket_id: number;
  status: string;
  suggested_reply: string;
  edited_reply: string | null;
  reviewed_by_agent_id: number;
  reviewed_at: string;
}

export interface SendSuggestionResponse {
  suggestion_id: number;
  ticket_id: number;
  message_id: number;
  status: string;
  sender_type: string;
}

export async function getAISuggestions(ticketId: number) {
  const response = await apiClient.get<AISuggestion[]>(
    `/tickets/${ticketId}/ai-suggestions`
  );

  return response.data;
}

export async function generateAISuggestion(ticketId: number) {
  const response =
    await apiClient.post<GenerateSuggestionResponse>(
      `/tickets/${ticketId}/suggest-reply`
    );

  return response.data;
}

export async function reviewAISuggestion(
  suggestionId: number,
  agentId: number,
  action: "approve" | "reject",
  editedReply?: string
) {
  const response =
    await apiClient.patch<ReviewSuggestionResponse>(
      `/tickets/${suggestionId}/review`,
      {
        agent_id: agentId,
        action,
        ...(editedReply !== undefined
          ? { edited_reply: editedReply }
          : {}),
      }
    );

  return response.data;
}

export async function sendAISuggestion(
  suggestionId: number,
  agentId: number
) {
  const response =
    await apiClient.post<SendSuggestionResponse>(
      `/ai-suggestions/${suggestionId}/send`,
      {
        agent_id: agentId,
      }
    );

  return response.data;
}
