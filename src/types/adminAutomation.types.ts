export type AutomationJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type AutomationStatusFilter =
  | "all"
  | AutomationJobStatus;

export interface AdminAutomationJob {
  id: number;
  ticket_id: number;
  status: AutomationJobStatus;
  attempt_count: number;
  error_message: string | null;
  crated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface AdminAutomationQuery {
  page?: number;
  limit?: number;
  status?: AutomationJobStatus;
  search?: number;
}

export interface AdminAutomationListResponse {
  items: AdminAutomationJob[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface AdminAutomationFilters {
  search: string;
  status: AutomationStatusFilter;
}

export interface AutomationJobStatistics {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  successRate: number;
}

export const MAX_AUTOMATION_ATTEMPTS = 3;