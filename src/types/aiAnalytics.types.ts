export interface AIAnalyticsOverview {
  total_jobs: number;
  pending_jobs: number;
  processing_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  success_rate: number;
  total_attempts: number;
}

export interface AIReplyAnalytics {
  total_suggestions: number;
  pending_suggestions: number;
  approved_suggestions: number;
  rejected_suggestions: number;
  sent_suggestions: number;
  edited_suggestions: number;
  approval_rate: number;
  rejection_rate: number;
  send_rate: number;
}

export interface AgentAIAnalytics {
  agent_id: number;
  agent_name: string;
  is_active: boolean;
  reviewed_suggestions: number;
  approved_suggestions: number;
  rejected_suggestions: number;
  sent_suggestions: number;
  edited_suggestions: number;
  acceptance_rate: number;
}

export interface AIAutomationTrend {
  date: string;
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  success_rate: number;
}

export type AIAnalyticsPeriod = 7 | 14 | 30;

export interface AIAnalyticsDashboardData {
  overview: AIAnalyticsOverview;
  replies: AIReplyAnalytics;
  agents: AgentAIAnalytics[];
  trends: AIAutomationTrend[];
  period: AIAnalyticsPeriod;
  fetchedAt: string;
}

export interface AIAnalyticsSummary {
  acceptedSuggestions: number;
  reviewedSuggestions: number;
  pendingSuggestions: number;
  approvedAwaitingSend: number;
  sentSuggestions: number;
  rejectedSuggestions: number;
  editedSuggestions: number;
  reviewRate: number;
  approvalRate: number;
  rejectionRate: number;
  sendRate: number;
  editRate: number;
  acceptedToSentRate: number;
}

export interface AIAutomationSummary {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  activeJobs: number;
  pendingJobs: number;
  processingJobs: number;
  successRate: number;
  failureRate: number;
  averageAttempts: number;
}

export interface AIAnalyticsChartItem {
  name: string;
  value: number;
  color: string;
}

export interface AgentAIAnalyticsSummary
  extends AgentAIAnalytics {
  acceptedSuggestions: number;
  rejectionRate: number;
  sendRate: number;
  editRate: number;
}