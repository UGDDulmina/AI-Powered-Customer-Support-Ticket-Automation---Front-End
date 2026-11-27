import {
  Ticket,
  Clock,
  LoaderCircle,
  CheckCircle2,
  Archive,
  Activity,
} from "lucide-react";

import type {
  CustomerTicketStatistics,
} from "../../../types/customer.types";

interface CustomerTicketStatsProps {
  stats: CustomerTicketStatistics;
}

const CustomerTicketStats = ({
  stats,
}: CustomerTicketStatsProps) => {
  const cards = [
    {
      title: "Total Tickets",
      value: stats.total,
      icon: Ticket,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      title: "Open Tickets",
      value: stats.open,
      icon: Clock,
      color: "text-amber-600",
      background: "bg-amber-50",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: LoaderCircle,
      color: "text-indigo-600",
      background: "bg-indigo-50",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "text-green-600",
      background: "bg-green-50",
    },
    {
      title: "Closed",
      value: stats.closed,
      icon: Archive,
      color: "text-slate-600",
      background: "bg-slate-100",
    },
    {
      title: "Active Tickets",
      value: stats.active,
      icon: Activity,
      color: "text-orange-600",
      background: "bg-orange-50",
    },
  ];

  const completionRate =
    stats.total > 0
      ? (stats.completed / stats.total) * 100
      : 0;

  return (
    <div className="space-y-4">

      <div className="grid grid-cols-1 gap-4
                      sm:grid-cols-2 xl:grid-cols-3">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200
                         bg-white p-5 shadow-sm"
            >

              <div className="flex items-center
                              justify-between gap-3">

                <p className="text-sm font-medium
                              text-slate-500">

                  {card.title}

                </p>

                <div className={`rounded-xl p-3
                  ${card.background} ${card.color}`}>

                  <Icon size={22} />

                </div>

              </div>

              <h3 className="mt-3 text-3xl
                             font-bold text-slate-900">

                {card.value.toLocaleString()}

              </h3>

            </div>
          );
        })}

      </div>

      <div className="rounded-xl border border-slate-200
                      bg-white p-5 shadow-sm">

        <div className="flex flex-wrap items-center
                        justify-between gap-3">

          <div>

            <h3 className="font-semibold text-slate-800">
              Ticket Completion Rate
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Resolved and closed tickets
            </p>

          </div>

          <span className="text-2xl font-bold text-green-600">

            {stats.total > 0
              ? `${completionRate.toFixed(1)}%`
              : "N/A"}

          </span>

        </div>

        <div
          role="progressbar"
          aria-label="Ticket completion rate"
          aria-valuenow={completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-5 h-3 overflow-hidden
                     rounded-full bg-slate-100"
        >

          <div
            className="h-full rounded-full
                       bg-green-500 transition-all"
            style={{
              width: `${Math.min(100, completionRate)}%`,
            }}
          />

        </div>

        <div className="mt-3 flex flex-wrap
                        justify-between gap-2
                        text-xs text-slate-500">

          <span>
            {stats.completed} completed tickets
          </span>

          <span>
            {stats.active} active tickets
          </span>

        </div>

      </div>

    </div>
  );
};

export default CustomerTicketStats;