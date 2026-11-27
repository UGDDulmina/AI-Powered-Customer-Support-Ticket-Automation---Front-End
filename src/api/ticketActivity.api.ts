import { apiClient } from "./client";

import type {
  TicketActivity,
} from "../types/ticketActivity.types";

export const getTicketActivities = async (
  ticketId: number,
  signal?: AbortSignal
): Promise<TicketActivity[]> => {
  const response = await apiClient.get<TicketActivity[]>(
    `/tickets/${ticketId}/activities`,
    { signal }
  );

  if (!Array.isArray(response.data)) {
    throw new Error(
      "Invalid ticket activity response."
    );
  }

  return response.data;
};