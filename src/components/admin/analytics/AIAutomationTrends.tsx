import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import type {
  AIAutomationTrend,
  AIAnalyticsPeriod,
} from "../../../types/aiAnalytics.types";

import {
  calculatePercentage,
  formatAnalyticsDate,
  formatAnalyticsPercentage,
} from "../../../utils/aiAnalytics.utils";

interface Props {
  trends: AIAutomationTrend[];
  period: AIAnalyticsPeriod;
}

export default function AIAutomationTrends({
  trends,
  period,
}: Props) {
  const totals = trends.reduce(
    (result, trend) => ({
      jobs: result.jobs + trend.total_jobs,
      completed: result.completed + trend.completed_jobs,
      failed: result.failed + trend.failed_jobs,
    }),
    {
      jobs: 0,
      completed: 0,
      failed: 0,
    }
  );

  const successRate = calculatePercentage(
    totals.completed,
    totals.jobs
  );

  const summary = [
    {
      title: "Total Jobs",
      value: totals.jobs,
      color: "text-blue-600",
    },
    {
      title: "Completed",
      value: totals.completed,
      color: "text-green-600",
    },
    {
      title: "Failed",
      value: totals.failed,
      color: "text-red-600",
    },
    {
      title: "Success Rate",
      value: formatAnalyticsPercentage(successRate),
      color: "text-purple-600",
    },
  ];

  return (
    <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Automation Performance Trends
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Automation jobs created during the last {period} days
          </p>
        </div>

        <span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600">
          UTC dates
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-gray-100 bg-gray-50 p-4"
          >
            <p className="text-xs font-medium text-gray-500">
              {item.title}
            </p>

            <p className={`mt-2 text-xl font-bold ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {totals.jobs === 0 && (
        <p className="mt-5 rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
          No automation jobs were created during this period.
        </p>
      )}

      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trends}
            margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="date"
              tickFormatter={formatAnalyticsDate}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              minTickGap={20}
            />

            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              labelFormatter={(value) =>
                formatAnalyticsDate(String(value))
              }
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="total_jobs"
              name="Total Jobs"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />

            <Line
              type="monotone"
              dataKey="completed_jobs"
              name="Completed"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />

            <Line
              type="monotone"
              dataKey="failed_jobs"
              name="Failed"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Jobs are grouped by creation date and their current status.
      </p>
    </section>
  );
}