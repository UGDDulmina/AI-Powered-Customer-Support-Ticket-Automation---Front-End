import {
  Ticket,
  Clock,
  LoaderCircle,
  CheckCircle2,
  Archive,
  AlertTriangle,
} from "lucide-react";

import type {
  AgentDashboardStatistics,
} from "../../types/agentDashboard.types";

interface AgentDashboardStatsProps {
  statistics: AgentDashboardStatistics;
}

const AgentDashboardStats = ({
  statistics,
}: AgentDashboardStatsProps) => {
  const cards = [
    {
      label: "Assigned Tickets",
      value: statistics.total,
      description: "All assigned support tickets",
      icon: Ticket,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      label: "Open Tickets",
      value: statistics.open,
      description: "Waiting for attention",
      icon: Clock,
      color: "text-amber-600",
      background: "bg-amber-50",
    },
    {
      label: "In Progress",
      value: statistics.inProgress,
      description: "Currently being handled",
      icon: LoaderCircle,
      color: "text-violet-600",
      background: "bg-violet-50",
    },
    {
      label: "Resolved Tickets",
      value: statistics.resolved,
      description: "Successfully resolved",
      icon: CheckCircle2,
      color: "text-green-600",
      background: "bg-green-50",
    },
    {
      label: "Closed Tickets",
      value: statistics.closed,
      description: "Closed support requests",
      icon: Archive,
      color: "text-slate-600",
      background: "bg-slate-100",
    },
    {
      label: "Urgent Tickets",
      value: statistics.urgent,
      description: `${statistics.activeUrgent} active urgent tickets`,
      icon: AlertTriangle,
      color: "text-red-600",
      background: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <section
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>

                <h3 className="mt-3 text-3xl font-bold text-slate-900">
                  {card.value.toLocaleString()}
                </h3>
              </div>

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.background} ${card.color}`}
              >
                <Icon size={24} />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              {card.description}
            </p>
          </section>
        );
      })}
    </div>
  );
};

export default AgentDashboardStats;