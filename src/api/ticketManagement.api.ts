import { apiClient } from "./client";

import type {
  TicketUpdateRequest,
  TicketPriorityUpdateRequest,
  TicketStatusUpdateRequest,
} from "../types/ticketManagement.types";

export const updateTicketInformation = async (
  ticketId: number,
  payload: TicketUpdateRequest
): Promise<void> => {
  await apiClient.put(`/tickets/${ticketId}`, {
    subject: payload.subject.trim(),
    description: payload.description.trim(),
    category: payload.category?.trim() || null,
    priority: payload.priority,
    status: payload.status,
  });
};

export const updateAdminTicketPriority = async (
  ticketId: number,
  payload: TicketPriorityUpdateRequest
): Promise<void> => {
  await apiClient.patch(
    `/tickets/${ticketId}/priority`,
    {
      priority: payload.priority,
    }
  );
};

export const updateAdminTicketStatus = async (
  ticketId: number,
  payload: TicketStatusUpdateRequest
): Promise<void> => {
  await apiClient.patch(
    `/tickets/${ticketId}/status`,
    {
      status: payload.status,
    }
  );
};