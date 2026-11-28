import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import type {
  AIAnalyticsDashboardData,
} from "../../../types/aiAnalytics.types";

import {
  getAutomationStatusChartData,
  getReplyStatusChartData,
  calculateAutomationSummary,
  formatAnalyticsPercentage,
} from "../../../utils/aiAnalytics.utils";

interface Props {
  data: AIAnalyticsDashboardData;
}

export default function AIAnalyticsCharts({ data }: Props) {
  const automationData = getAutomationStatusChartData(data.overview);
  const replyData = getReplyStatusChartData(data.replies);
  const automation = calculateAutomationSummary(data.overview);

  const hasAutomationData = automationData.some(
    (item) => item.value > 0
  );

  const hasReplyData = replyData.some(
    (item) => item.value > 0
  );

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Automation Status Distribution
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Current status of all automation jobs
        </p>

        {hasAutomationData ? (
          <div className="relative mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={automationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {automationData.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.color}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">
                {formatAnalyticsPercentage(automation.successRate)}
              </span>

              <span className="text-xs text-gray-500">
                Success Rate
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-gray-500">
            No automation jobs available.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {automationData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />

                <span className="text-sm text-gray-600">
                  {item.name}
                </span>
              </div>

              <span className="font-semibold text-gray-900">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          AI Reply Status Distribution
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Current status of generated AI suggestions
        </p>

        {hasReplyData ? (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={replyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  name="Suggestions"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={55}
                >
                  {replyData.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-gray-500">
            No AI suggestions available.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {replyData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />

                <span className="text-sm text-gray-600">
                  {item.name}
                </span>
              </div>

              <span className="font-semibold text-gray-900">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}