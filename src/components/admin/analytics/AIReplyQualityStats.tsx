import {
  ClipboardCheck,
  ThumbsUp,
  ThumbsDown,
  PencilLine,
  Send,
  MessageSquare,
} from "lucide-react";

import type { AIReplyAnalytics } from "../../../types/aiAnalytics.types";

import {
  calculateReplySummary,
  formatAnalyticsPercentage,
} from "../../../utils/aiAnalytics.utils";

interface Props {
  replies: AIReplyAnalytics;
}

export default function AIReplyQualityStats({ replies }: Props) {
  const summary = calculateReplySummary(replies);

  const cards = [
    {
      title: "Review Rate",
      value: summary.reviewRate,
      available: replies.total_suggestions > 0,
      description: `${summary.reviewedSuggestions} of ${replies.total_suggestions} suggestions reviewed`,
      icon: ClipboardCheck,
      color: "text-blue-600 bg-blue-50",
      barColor: "bg-blue-500",
    },
    {
      title: "Approval Rate",
      value: summary.approvalRate,
      available: summary.reviewedSuggestions > 0,
      description: `${summary.acceptedSuggestions} accepted suggestions`,
      icon: ThumbsUp,
      color: "text-green-600 bg-green-50",
      barColor: "bg-green-500",
    },
    {
      title: "Rejection Rate",
      value: summary.rejectionRate,
      available: summary.reviewedSuggestions > 0,
      description: `${summary.rejectedSuggestions} rejected suggestions`,
      icon: ThumbsDown,
      color: "text-red-600 bg-red-50",
      barColor: "bg-red-500",
    },
    {
      title: "Editing Rate",
      value: summary.editRate,
      available: replies.total_suggestions > 0,
      description: `${summary.editedSuggestions} suggestions edited`,
      icon: PencilLine,
      color: "text-purple-600 bg-purple-50",
      barColor: "bg-purple-500",
    },
    {
      title: "Send Rate",
      value: summary.sendRate,
      available: replies.total_suggestions > 0,
      description: `${summary.sentSuggestions} suggestions sent`,
      icon: Send,
      color: "text-indigo-600 bg-indigo-50",
      barColor: "bg-indigo-500",
    },
    {
      title: "Accepted-to-Sent Rate",
      value: summary.acceptedToSentRate,
      available: summary.acceptedSuggestions > 0,
      description: `${summary.sentSuggestions} of ${summary.acceptedSuggestions} accepted suggestions sent`,
      icon: MessageSquare,
      color: "text-teal-600 bg-teal-50",
      barColor: "bg-teal-500",
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          AI Reply Quality and Review Analytics
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Measure human review decisions and AI suggestion utilization
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>

                <div className={`rounded-lg p-2.5 ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <p className="mt-3 text-3xl font-bold text-gray-900">
                {card.available
                  ? formatAnalyticsPercentage(card.value)
                  : "N/A"}
              </p>

              <div
                role="progressbar"
                aria-label={card.title}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={
                  card.available
                    ? Math.max(0, Math.min(100, card.value))
                    : undefined
                }
                className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${card.barColor}`}
                  style={{
                    width: `${Math.max(0, Math.min(100, card.value))}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs text-gray-500">
                {card.available
                  ? card.description
                  : "Insufficient data"}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}