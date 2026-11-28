import {
  Target,
  CheckCircle2,
  Clock,
  Ticket,
} from "lucide-react";

import type {
  AgentDashboardStatistics,
} from "../../../types/agentDashboard.types";

interface AgentCompletionCardProps {
  statistics: AgentDashboardStatistics;
}

const AgentCompletionCard = ({
  statistics,
}: AgentCompletionCardProps) => {
  const completionRate = Math.min(
    100,
    Math.max(0, statistics.completionRate)
  );

  const summary = [
    {
      label: "Total Assigned",
      value: statistics.total,
      icon: Ticket,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      label: "Completed",
      value: statistics.completed,
      icon: CheckCircle2,
      color: "text-green-600",
      background: "bg-green-50",
    },
    {
      label: "Active Tickets",
      value: statistics.active,
      icon: Clock,
      color: "text-amber-600",
      background: "bg-amber-50",
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-green-50 p-3 text-green-600">
            <Target size={24} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-800">
              Ticket Completion Rate
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Percentage of assigned tickets resolved or closed
            </p>
          </div>
        </div>

        <div className="text-3xl font-bold text-green-600">
          {statistics.total > 0
            ? `${completionRate.toFixed(1)}%`
            : "N/A"}
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="Ticket completion rate"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={completionRate}
        className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${completionRate}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {statistics.completed} of {statistics.total} assigned
        tickets completed.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <div
                className={`rounded-lg p-3 ${item.background} ${item.color}`}
              >
                <Icon size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  {item.label}
                </p>

                <p className="mt-1 text-xl font-bold text-slate-800">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AgentCompletionCard;