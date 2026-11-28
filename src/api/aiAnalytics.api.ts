import { apiClient } from "./client";

import type {
  AIAnalyticsOverview,
  AIReplyAnalytics,
  AgentAIAnalytics,
  AIAutomationTrend,
  AIAnalyticsPeriod,
  AIAnalyticsDashboardData,
} from "../types/aiAnalytics.types";

import {
  fillMissingTrendDates,
  sortAgentsByReviewedSuggestions,
} from "../utils/aiAnalytics.utils";

export const getAIAnalyticsOverview = async (
  signal?: AbortSignal
): Promise<AIAnalyticsOverview> => {
  const response =
    await apiClient.get<AIAnalyticsOverview>(
      "/ai-analytics/overview",
      { signal }
    );

  return response.data;
};

export const getAIReplyAnalytics = async (
  signal?: AbortSignal
): Promise<AIReplyAnalytics> => {
  const response =
    await apiClient.get<AIReplyAnalytics>(
      "/ai-analytics/replies",
      { signal }
    );

  return response.data;
};

export const getAgentAIAnalytics = async (
  signal?: AbortSignal
): Promise<AgentAIAnalytics[]> => {
  const response =
    await apiClient.get<AgentAIAnalytics[]>(
      "/ai-analytics/agents",
      { signal }
    );

  if (!Array.isArray(response.data)) {
    throw new Error(
      "Invalid agent analytics response."
    );
  }

  return sortAgentsByReviewedSuggestions(
    response.data
  );
};

export const getAIAutomationTrends = async (
  period: AIAnalyticsPeriod = 7,
  signal?: AbortSignal
): Promise<AIAutomationTrend[]> => {
  const response =
    await apiClient.get<AIAutomationTrend[]>(
      "/ai-analytics/trends",
      {
        params: {
          days: period,
        },
        signal,
      }
    );

  if (!Array.isArray(response.data)) {
    throw new Error(
      "Invalid automation trends response."
    );
  }

  return fillMissingTrendDates(
    response.data,
    period
  );
};

export const getAIAnalyticsDashboardData = async (
  period: AIAnalyticsPeriod = 7,
  signal?: AbortSignal
): Promise<AIAnalyticsDashboardData> => {
  const [
    overview,
    replies,
    agents,
    trends,
  ] = await Promise.all([
    getAIAnalyticsOverview(signal),
    getAIReplyAnalytics(signal),
    getAgentAIAnalytics(signal),
    getAIAutomationTrends(period, signal),
  ]);

  return {
    overview,
    replies,
    agents,
    trends,
    period,
    fetchedAt: new Date().toISOString(),
  };
};