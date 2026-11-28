import type {
  AIAnalyticsOverview,
  AIReplyAnalytics,
  AgentAIAnalytics,
  AIAutomationTrend,
  AIAnalyticsPeriod,
  AIAnalyticsSummary,
  AIAutomationSummary,
  AIAnalyticsChartItem,
  AgentAIAnalyticsSummary,
} from "../types/aiAnalytics.types";

export const calculatePercentage = (
  numerator: number,
  denominator: number
): number => {
  if (denominator <= 0) {
    return 0;
  }

  return Number(
    ((numerator / denominator) * 100).toFixed(2)
  );
};

export const calculateReplySummary = (
  replies: AIReplyAnalytics
): AIAnalyticsSummary => {
  const acceptedSuggestions =
    replies.approved_suggestions +
    replies.sent_suggestions;

  const reviewedSuggestions =
    acceptedSuggestions +
    replies.rejected_suggestions;

  return {
    acceptedSuggestions,
    reviewedSuggestions,

    pendingSuggestions:
      replies.pending_suggestions,

    approvedAwaitingSend:
      replies.approved_suggestions,

    sentSuggestions:
      replies.sent_suggestions,

    rejectedSuggestions:
      replies.rejected_suggestions,

    editedSuggestions:
      replies.edited_suggestions,

    reviewRate: calculatePercentage(
      reviewedSuggestions,
      replies.total_suggestions
    ),

    approvalRate: calculatePercentage(
      acceptedSuggestions,
      reviewedSuggestions
    ),

    rejectionRate: calculatePercentage(
      replies.rejected_suggestions,
      reviewedSuggestions
    ),

    sendRate: calculatePercentage(
      replies.sent_suggestions,
      replies.total_suggestions
    ),

    editRate: calculatePercentage(
      replies.edited_suggestions,
      replies.total_suggestions
    ),

    acceptedToSentRate: calculatePercentage(
      replies.sent_suggestions,
      acceptedSuggestions
    ),
  };
};

export const calculateAutomationSummary = (
  overview: AIAnalyticsOverview
): AIAutomationSummary => {
  return {
    totalJobs: overview.total_jobs,

    completedJobs: overview.completed_jobs,

    failedJobs: overview.failed_jobs,

    activeJobs:
      overview.pending_jobs +
      overview.processing_jobs,

    pendingJobs: overview.pending_jobs,

    processingJobs: overview.processing_jobs,

    successRate: calculatePercentage(
      overview.completed_jobs,
      overview.total_jobs
    ),

    failureRate: calculatePercentage(
      overview.failed_jobs,
      overview.total_jobs
    ),

    averageAttempts:
      overview.total_jobs > 0
        ? Number(
            (
              overview.total_attempts /
              overview.total_jobs
            ).toFixed(2)
          )
        : 0,
  };
};

export const calculateAgentSummary = (
  agent: AgentAIAnalytics
): AgentAIAnalyticsSummary => {
  const acceptedSuggestions =
    agent.approved_suggestions +
    agent.sent_suggestions;

  return {
    ...agent,

    acceptedSuggestions,

    rejectionRate: calculatePercentage(
      agent.rejected_suggestions,
      agent.reviewed_suggestions
    ),

    sendRate: calculatePercentage(
      agent.sent_suggestions,
      agent.reviewed_suggestions
    ),

    editRate: calculatePercentage(
      agent.edited_suggestions,
      agent.reviewed_suggestions
    ),
  };
};

export const getAutomationStatusChartData = (
  overview: AIAnalyticsOverview
): AIAnalyticsChartItem[] => {
  return [
    {
      name: "Completed",
      value: overview.completed_jobs,
      color: "#16a34a",
    },
    {
      name: "Pending",
      value: overview.pending_jobs,
      color: "#f59e0b",
    },
    {
      name: "Processing",
      value: overview.processing_jobs,
      color: "#2563eb",
    },
    {
      name: "Failed",
      value: overview.failed_jobs,
      color: "#dc2626",
    },
  ];
};

export const getReplyStatusChartData = (
  replies: AIReplyAnalytics
): AIAnalyticsChartItem[] => {
  return [
    {
      name: "Pending",
      value: replies.pending_suggestions,
      color: "#f59e0b",
    },
    {
      name: "Approved",
      value: replies.approved_suggestions,
      color: "#2563eb",
    },
    {
      name: "Rejected",
      value: replies.rejected_suggestions,
      color: "#dc2626",
    },
    {
      name: "Sent",
      value: replies.sent_suggestions,
      color: "#16a34a",
    },
  ];
};

export const fillMissingTrendDates = (
  trends: AIAutomationTrend[],
  period: AIAnalyticsPeriod,
  referenceDate: Date = new Date()
): AIAutomationTrend[] => {
  const trendMap = new Map(
    trends.map((trend) => [
      trend.date.slice(0, 10),
      trend,
    ])
  );

  const result: AIAutomationTrend[] = [];

  for (let index = period - 1; index >= 0; index--) {
    const date = new Date(referenceDate);

    date.setUTCDate(
      date.getUTCDate() - index
    );

    const dateKey = date
      .toISOString()
      .slice(0, 10);

    const existingTrend =
      trendMap.get(dateKey);

    result.push(
      existingTrend
        ? {
            ...existingTrend,
            date: dateKey,
          }
        : {
            date: dateKey,
            total_jobs: 0,
            completed_jobs: 0,
            failed_jobs: 0,
            success_rate: 0,
          }
    );
  }

  return result;
};

export const formatAnalyticsDate = (
  value: string
): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
};

export const formatAnalyticsNumber = (
  value: number
): string => {
  return new Intl.NumberFormat("en-US").format(
    value
  );
};

export const formatAnalyticsPercentage = (
  value: number
): string => {
  return `${value.toFixed(1)}%`;
};

export const sortAgentsByReviewedSuggestions = (
  agents: AgentAIAnalytics[]
): AgentAIAnalytics[] => {
  return [...agents].sort(
    (first, second) =>
      second.reviewed_suggestions -
        first.reviewed_suggestions ||
      second.acceptance_rate -
        first.acceptance_rate ||
      first.agent_id - second.agent_id
  );
};