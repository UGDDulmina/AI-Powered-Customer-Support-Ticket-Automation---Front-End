import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type {
  TicketStatusStats,
} from "../../../types/adminDashboard.types";


interface TicketStatusChartProps {
  stats: TicketStatusStats;
}


const TicketStatusChart = ({
  stats,
}: TicketStatusChartProps) => {

  const chartData = [
    {
      name: "Open",
      value: stats.open,
      color: "#f59e0b",
    },
    {
      name: "In Progress",
      value: stats.in_progress,
      color: "#3b82f6",
    },
    {
      name: "Resolved",
      value: stats.resolved,
      color: "#22c55e",
    },
    {
      name: "Closed",
      value: stats.closed,
      color: "#94a3b8",
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

        Ticket Status Distribution

      </h2>

      <p className="mt-1 text-sm text-slate-500">

        Breakdown of tickets by current status

      </p>


      {total === 0 ? (

        <div className="flex h-72 items-center
                        justify-center
                        text-sm text-slate-500">

          No ticket data available.

        </div>

      ) : (

        <div className="relative mt-4 h-72">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <PieChart>

              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
                stroke="none"
              >

                {chartData.map((item) => (

                  <Cell
                    key={item.name}
                    fill={item.color}
                  />

                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>


          {/* Donut center */}

          <div className="pointer-events-none
                          absolute inset-0
                          flex flex-col
                          items-center
                          justify-center">

            <span className="text-3xl
                             font-bold
                             text-slate-900">

              {total.toLocaleString()}

            </span>

            <span className="text-xs
                             text-slate-500">

              Total Tickets

            </span>

          </div>

        </div>

      )}


      {/* Custom legend */}

      <div className="mt-4 space-y-3">

        {chartData.map((item) => (

          <div
            key={item.name}
            className="flex items-center
                       justify-between"
          >

            <div className="flex items-center
                            gap-2">

              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />

              <span className="text-sm
                               text-slate-600">

                {item.name}

              </span>

            </div>


            <div className="flex items-center
                            gap-3">

              <span className="text-sm
                               font-semibold
                               text-slate-800">

                {item.value.toLocaleString()}

              </span>

              <span className="w-14 text-right
                               text-xs
                               text-slate-500">

                {total > 0
                  ? (
                      (item.value / total) * 100
                    ).toFixed(1)
                  : "0.0"}%

              </span>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};


export default TicketStatusChart;