import { apiClient } from "./client";
import { getAIAnalyticsOverview } from "./aiAnalytics.api";

import type {
  AdminAutomationJob,
  AdminAutomationQuery,
  AdminAutomationListResponse,
  AutomationJobStatistics,
} from "../types/adminAutomation.types";

import {
  calculatePercentage,
} from "../utils/aiAnalytics.utils";

export const getAdminAutomationJobs = async (
  query: AdminAutomationQuery = {},
  signal?: AbortSignal
): Promise<AdminAutomationListResponse> => {
  const response =
    await apiClient.get<AdminAutomationListResponse>(
      "/ai-automation/jobs",
      {
        params: {
          page: query.page ?? 1,
          limit: query.limit ?? 10,
          status: query.status,
          search: query.search,
        },
        signal,
      }
    );

  if (!Array.isArray(response.data.items)) {
    throw new Error("Invalid automation jobs response.");
  }

  return response.data;
};

export const getAdminAutomationJobById = async (
  jobId: number,
  signal?: AbortSignal
): Promise<AdminAutomationJob> => {
  const response =
    await apiClient.get<AdminAutomationJob>(
      `/ai-automation/jobs/${jobId}`,
      { signal }
    );

  return response.data;
};

export const retryAdminAutomationJob = async (
  jobId: number
): Promise<AdminAutomationJob> => {
  const response =
    await apiClient.post<AdminAutomationJob>(
      `/ai-automation/jobs/${jobId}/retry`
    );

  return response.data;
};

export const getAutomationJobStatistics = async (
  signal?: AbortSignal
): Promise<AutomationJobStatistics> => {
  const overview = await getAIAnalyticsOverview(signal);

  return {
    total: overview.total_jobs,
    pending: overview.pending_jobs,
    processing: overview.processing_jobs,
    completed: overview.completed_jobs,
    failed: overview.failed_jobs,
    successRate: calculatePercentage(
      overview.completed_jobs,
      overview.total_jobs
    ),
  };
};