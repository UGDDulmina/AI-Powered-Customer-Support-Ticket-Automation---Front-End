import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type {
  TicketPriorityStats,
} from "../../../types/adminDashboard.types";


interface TicketPriorityChartProps {
  stats: TicketPriorityStats;
}


const TicketPriorityChart = ({
  stats,
}: TicketPriorityChartProps) => {

  const chartData = [
    {
      name: "Low",
      value: stats.low,
      color: "#22c55e",
    },
    {
      name: "Medium",
      value: stats.medium,
      color: "#3b82f6",
    },
    {
      name: "High",
      value: stats.high,
      color: "#f59e0b",
    },
    {
      name: "Urgent",
      value: stats.urgent,
      color: "#ef4444",
    },
  ];


  const total = chartData.reduce(
    (sum, item) => sum + item.value,
    0
  );


  return (

    <div className="rounded-xl border
                    border-slate-200
                    bg-white p-5 shadow-sm">

      <h2 className="text-lg font-semibold
                     text-slate-800">

        Ticket Priority Distribution

      </h2>

      <p className="mt-1 text-sm text-slate-500">

        Monitor ticket urgency levels

      </p>


      {total === 0 ? (

        <div className="flex h-72 items-center
                        justify-center
                        text-sm text-slate-500">

          No priority data available.

        </div>

      ) : (

        <div className="mt-6 h-72">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -15,
                bottom: 5,
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
                  fill: "#64748b",
                  fontSize: 12,
                }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
              />

              <Tooltip
                cursor={{
                  fill: "#f8fafc",
                }}
              />

              <Bar
                dataKey="value"
                name="Tickets"
                radius={[6, 6, 0, 0]}
                maxBarSize={65}
              >

                {chartData.map((item) => (

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


      {/* Priority summary */}

      <div className="mt-4 grid
                      grid-cols-2 gap-3">

        {chartData.map((item) => (

          <div
            key={item.name}
            className="rounded-lg
                       bg-slate-50 p-3"
          >

            <div className="flex items-center
                            gap-2">

              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />

              <span className="text-xs
                               text-slate-500">

                {item.name}

              </span>

            </div>

            <p className="mt-1 text-xl
                          font-bold
                          text-slate-800">

              {item.value.toLocaleString()}

            </p>

          </div>

        ))}

      </div>

    </div>

  );

};


export default TicketPriorityChart;