import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type {
  AgentDashboardData,
} from "../../../types/agentDashboard.types";

interface AgentDashboardChartsProps {
  data: AgentDashboardData;
}

const AgentDashboardCharts = ({
  data,
}: AgentDashboardChartsProps) => {
  const statusData = [
    {
      name: "Open",
      value: data.statusDistribution.open,
      color: "#3b82f6",
    },
    {
      name: "In Progress",
      value: data.statusDistribution.in_progress,
      color: "#f59e0b",
    },
    {
      name: "Resolved",
      value: data.statusDistribution.resolved,
      color: "#22c55e",
    },
    {
      name: "Closed",
      value: data.statusDistribution.closed,
      color: "#94a3b8",
    },
  ];

  const priorityData = [
    {
      name: "Low",
      value: data.priorityDistribution.low,
      color: "#22c55e",
    },
    {
      name: "Medium",
      value: data.priorityDistribution.medium,
      color: "#3b82f6",
    },
    {
      name: "High",
      value: data.priorityDistribution.high,
      color: "#f59e0b",
    },
    {
      name: "Urgent",
      value: data.priorityDistribution.urgent,
      color: "#ef4444",
    },
  ];

  const total = data.statistics.total;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h3 className="font-semibold text-slate-800">
            Ticket Status Distribution
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Current status of your assigned tickets
          </p>
        </div>

        {total === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            No ticket data available.
          </div>
        ) : (
          <div className="relative mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={2}
                  stroke="none"
                >
                  {statusData.map((item) => (
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
              <span className="text-3xl font-bold text-slate-900">
                {total}
              </span>

              <span className="text-xs text-slate-500">
                Total Tickets
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {statusData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />

                <span className="text-xs text-slate-600">
                  {item.name}
                </span>
              </div>

              <span className="text-sm font-semibold text-slate-800">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h3 className="font-semibold text-slate-800">
            Ticket Priority Distribution
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Assigned tickets grouped by priority
          </p>
        </div>

        {total === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            No ticket data available.
          </div>
        ) : (
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                />

                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                />

                <Bar
                  dataKey="value"
                  name="Tickets"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={55}
                >
                  {priorityData.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          {priorityData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />

                <span className="text-xs text-slate-600">
                  {item.name}
                </span>
              </div>

              <span className="text-sm font-semibold text-slate-800">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AgentDashboardCharts;