import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import {
  ChartPie,
} from "lucide-react";

import type {
  CustomerDashboardStatistics,
} from "../../../types/customerDashboard.types";

interface CustomerDashboardChartProps {
  statistics: CustomerDashboardStatistics;
}

export default function CustomerDashboardChart({
  statistics,
}: CustomerDashboardChartProps) {
  const chartData = [
    {
      name: "Open",
      value: statistics.open,
      color: "#f59e0b",
    },
    {
      name: "In Progress",
      value: statistics.in_progress,
      color: "#8b5cf6",
    },
    {
      name: "Resolved",
      value: statistics.resolved,
      color: "#22c55e",
    },
    {
      name: "Closed",
      value: statistics.closed,
      color: "#64748b",
    },
  ];

  const total = chartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const visibleData = chartData.filter(
    (item) => item.value > 0
  );

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">
        Ticket Status Distribution
      </h2>

      <p className="mt-1 text-xs text-gray-500">
        Overview of your support ticket statuses
      </p>

      {total === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gray-100 p-4">
            <ChartPie
              size={32}
              className="text-gray-400"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-gray-600">
            No ticket data available
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Create a support ticket to get started.
          </p>
        </div>
      ) : (
        <div className="relative mt-4 h-56">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={visibleData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={
                  visibleData.length > 1 ? 3 : 0
                }
                stroke="none"
              >
                {visibleData.map((item) => (
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
            <p className="text-3xl font-bold text-gray-900">
              {total}
            </p>

            <p className="text-xs text-gray-500">
              Total Tickets
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />

              <span className="text-sm text-gray-600">
                {item.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                {total > 0
                  ? (
                      (item.value / total) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </span>

              <span className="w-8 text-right text-sm font-semibold text-gray-800">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}