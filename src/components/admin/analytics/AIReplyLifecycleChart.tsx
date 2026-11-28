import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { Workflow } from "lucide-react";

import type { AIReplyAnalytics } from "../../../types/aiAnalytics.types";

import {
  calculateReplySummary,
  calculatePercentage,
  formatAnalyticsPercentage,
  formatAnalyticsNumber,
} from "../../../utils/aiAnalytics.utils";

interface Props {
  replies: AIReplyAnalytics;
}

export default function AIReplyLifecycleChart({ replies }: Props) {
  const summary = calculateReplySummary(replies);

  const stages = [
    {
      name: "Generated",
      value: replies.total_suggestions,
      color: "#2563eb",
    },
    {
      name: "Reviewed",
      value: summary.reviewedSuggestions,
      color: "#7c3aed",
    },
    {
      name: "Accepted",
      value: summary.acceptedSuggestions,
      color: "#0891b2",
    },
    {
      name: "Sent",
      value: summary.sentSuggestions,
      color: "#16a34a",
    },
  ];

  return (
    <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Workflow size={21} className="text-blue-600" />

        <h2 className="text-lg font-semibold text-gray-900">
          AI Suggestion Lifecycle
        </h2>
      </div>

      <p className="mt-1 text-sm text-gray-500">
        Track suggestions from generation to customer delivery
      </p>

      {replies.total_suggestions > 0 ? (
        <>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stages}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 25,
                  left: 15,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e5e7eb"
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={85}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  name="Suggestions"
                  radius={[0, 5, 5, 0]}
                  maxBarSize={40}
                >
                  {stages.map((stage) => (
                    <Cell
                      key={stage.name}
                      fill={stage.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-3">
            {stages.map((stage) => {
              const percentage = calculatePercentage(
                stage.value,
                replies.total_suggestions
              );

              return (
                <div
                  key={stage.name}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />

                    <span className="text-sm font-medium text-gray-600">
                      {stage.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">
                      {formatAnalyticsNumber(stage.value)}
                    </span>

                    <span className="w-16 text-right text-xs text-gray-500">
                      {formatAnalyticsPercentage(percentage)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex h-72 flex-col items-center justify-center">
          <Workflow size={36} className="text-gray-300" />

          <p className="mt-3 text-sm text-gray-500">
            No AI suggestions have been generated yet.
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">
        Lifecycle stages overlap and should not be added together.
        Accepted suggestions include approved and sent replies.
      </p>
    </section>
  );
}