
import { apiClient } from "./client";


export interface AutomationJob {
  id: number;
  ticket_id: number;
  status: string;
  attempt_count: number;
  error_message: string | null;
  crated_at: string;
  started_at: string | null;
  completed_at: string | null;
}


export async function getTicketAutomationJobs(
  ticketId: number
): Promise<AutomationJob[]> {
  const response = await apiClient.get<AutomationJob[]>(
    `/tickets/${ticketId}/ai-automation/jobs`
  );

  return response.data;
}


export async function getAutomationJob(
  jobId: number
): Promise<AutomationJob> {
  const response = await apiClient.get<AutomationJob>(
    `/ai-automation/jobs/${jobId}`
  );

  return response.data;
}


export async function retryAutomationJob(
  jobId: number
): Promise<AutomationJob> {
  const response = await apiClient.post<AutomationJob>(
    `/ai-automation/jobs/${jobId}/retry`
  );

  return response.data;
}
