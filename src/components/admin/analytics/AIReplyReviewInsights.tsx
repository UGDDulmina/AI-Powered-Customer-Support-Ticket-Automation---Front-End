import {
  BrainCircuit,
  Clock,
  Send,
  PencilLine,
  Info,
} from "lucide-react";

import type { AIReplyAnalytics } from "../../../types/aiAnalytics.types";

import {
  calculateReplySummary,
  formatAnalyticsPercentage,
  formatAnalyticsNumber,
} from "../../../utils/aiAnalytics.utils";

interface Props {
  replies: AIReplyAnalytics;
}

export default function AIReplyReviewInsights({ replies }: Props) {
  const summary = calculateReplySummary(replies);

  const backlogItems = [
    {
      title: "Awaiting Review",
      value: summary.pendingSuggestions,
      description: "Suggestions requiring a human review decision",
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Approved but Not Sent",
      value: summary.approvedAwaitingSend,
      description: "Approved suggestions awaiting delivery",
      icon: Send,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Edited Suggestions",
      value: summary.editedSuggestions,
      description: "Suggestions containing agent edits",
      icon: PencilLine,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const insights: string[] = [];

  if (replies.total_suggestions === 0) {
    insights.push(
      "Generate AI suggestions to begin collecting review analytics."
    );
  } else {
    if (summary.pendingSuggestions > 0) {
      insights.push(
        `${summary.pendingSuggestions} suggestions are awaiting review. Agents should review pending suggestions before sending responses.`
      );
    }

    if (summary.approvedAwaitingSend > 0) {
      insights.push(
        `${summary.approvedAwaitingSend} approved suggestions have not been sent. Check whether these responses are still required.`
      );
    }

    if (summary.rejectedSuggestions > 0) {
      insights.push(
        `${summary.rejectedSuggestions} suggestions have been rejected. Review rejected responses to identify potential prompt or context improvements.`
      );
    }

    if (summary.editedSuggestions > 0) {
      insights.push(
        `${summary.editedSuggestions} suggestions contain agent edits. Examine these edits to identify recurring response improvements.`
      );
    }

    if (summary.reviewedSuggestions === 0) {
      insights.push(
        "Approval and rejection rates are unavailable until suggestions are reviewed."
      );
    } else {
      insights.push(
        `${formatAnalyticsPercentage(summary.approvalRate)} of reviewed suggestions have been accepted by staff.`
      );
    }
  }

  return (
    <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <BrainCircuit size={22} className="text-purple-600" />

        <h2 className="text-lg font-semibold text-gray-900">
          AI Review Insights
        </h2>
      </div>

      <p className="mt-1 text-sm text-gray-500">
        Review decisions, pending work and improvement opportunities
      </p>

      <div className="mt-6 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-800">
          Review Decision Distribution
        </h3>

        {summary.reviewedSuggestions > 0 ? (
          <>
            <div className="mt-4 flex h-5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="bg-green-500 transition-all duration-500"
                style={{
                  width: `${Math.max(0, Math.min(100, summary.approvalRate))}%`,
                }}
              />

              <div
                className="bg-red-500 transition-all duration-500"
                style={{
                  width: `${Math.max(0, Math.min(100, summary.rejectionRate))}%`,
                }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-xs font-medium text-green-700">
                  Accepted
                </p>

                <p className="mt-1 text-xl font-bold text-green-700">
                  {formatAnalyticsPercentage(summary.approvalRate)}
                </p>

                <p className="mt-1 text-xs text-green-600">
                  {summary.acceptedSuggestions} suggestions
                </p>
              </div>

              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-xs font-medium text-red-700">
                  Rejected
                </p>

                <p className="mt-1 text-xl font-bold text-red-700">
                  {formatAnalyticsPercentage(summary.rejectionRate)}
                </p>

                <p className="mt-1 text-xs text-red-600">
                  {summary.rejectedSuggestions} suggestions
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            No reviewed suggestions available.
          </p>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {backlogItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
            >
              <div className={`rounded-lg p-3 ${item.color}`}>
                <Icon size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  {item.title}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {item.description}
                </p>
              </div>

              <p className="text-xl font-bold text-gray-900">
                {formatAnalyticsNumber(item.value)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center gap-2">
          <Info size={18} className="text-blue-600" />

          <h3 className="text-sm font-semibold text-gray-800">
            Operational Insights
          </h3>
        </div>

        <ul className="mt-3 space-y-3">
          {insights.map((insight) => (
            <li
              key={insight}
              className="flex items-start gap-2 text-sm leading-relaxed text-gray-600"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />

              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-gray-400">
        Acceptance and editing rates reflect staff behavior.
        They do not independently establish AI response accuracy
        or customer satisfaction.
      </p>
    </section>
  );
}