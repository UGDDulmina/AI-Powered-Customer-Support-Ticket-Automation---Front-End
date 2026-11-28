import {
  Workflow,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ThumbsUp,
  Send,
  Clock,
  ThumbsDown,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import type {
  AIAnalyticsDashboardData,
} from "../../../types/aiAnalytics.types";

import {
  calculateAutomationSummary,
  calculateReplySummary,
  formatAnalyticsNumber,
  formatAnalyticsPercentage,
} from "../../../utils/aiAnalytics.utils";

interface Props {
  data: AIAnalyticsDashboardData;
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">
          {title}
        </p>

        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon size={20} />
        </div>
      </div>

      <h3 className="mt-3 text-3xl font-bold text-gray-900">
        {value}
      </h3>

      <p className="mt-2 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}

export default function AIAnalyticsStats({ data }: Props) {
  const automation = calculateAutomationSummary(data.overview);
  const replies = calculateReplySummary(data.replies);

  const cards: StatCardProps[] = [
    {
      title: "Total Automation Jobs",
      value: formatAnalyticsNumber(automation.totalJobs),
      description: "All registered automation jobs",
      icon: Workflow,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Automation Success Rate",
      value: formatAnalyticsPercentage(automation.successRate),
      description: `${automation.completedJobs} completed jobs`,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Failed Automation Jobs",
      value: formatAnalyticsNumber(automation.failedJobs),
      description: `${automation.failureRate}% of total jobs`,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Active Automation Jobs",
      value: formatAnalyticsNumber(automation.activeJobs),
      description: "Pending and processing jobs",
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Total AI Suggestions",
      value: formatAnalyticsNumber(data.replies.total_suggestions),
      description: `${replies.pendingSuggestions} awaiting review`,
      icon: MessageSquare,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "AI Approval Rate",
      value: formatAnalyticsPercentage(replies.approvalRate),
      description: `${replies.acceptedSuggestions} accepted suggestions`,
      icon: ThumbsUp,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "AI Rejection Rate",
      value: formatAnalyticsPercentage(replies.rejectionRate),
      description: `${replies.rejectedSuggestions} rejected suggestions`,
      icon: ThumbsDown,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "AI Send Rate",
      value: formatAnalyticsPercentage(replies.sendRate),
      description: `${replies.sentSuggestions} suggestions sent`,
      icon: Send,
      color: "bg-indigo-50 text-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}