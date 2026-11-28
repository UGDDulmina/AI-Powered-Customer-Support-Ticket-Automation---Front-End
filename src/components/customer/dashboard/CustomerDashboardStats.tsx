import {
  Ticket,
  FolderOpen,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import type {
  CustomerDashboardStatistics,
} from "../../../types/customerDashboard.types";

interface CustomerDashboardStatsProps {
  statistics: CustomerDashboardStatistics;
}

export default function CustomerDashboardStats({
  statistics,
}: CustomerDashboardStatsProps) {
  const cards = [
    {
      label: "Total Tickets",
      value: statistics.total,
      description: "All your support requests",
      icon: Ticket,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Open Tickets",
      value: statistics.open,
      description: "Awaiting support",
      icon: FolderOpen,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "In Progress",
      value: statistics.in_progress,
      description: "Currently being handled",
      icon: Clock3,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Completed Tickets",
      value:
        statistics.resolved +
        statistics.closed,
      description: "Resolved and closed requests",
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-500">
                {card.label}
              </p>

              <div className={`rounded-xl p-3 ${card.color}`}>
                <Icon size={22} />
              </div>
            </div>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {card.value.toLocaleString()}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}