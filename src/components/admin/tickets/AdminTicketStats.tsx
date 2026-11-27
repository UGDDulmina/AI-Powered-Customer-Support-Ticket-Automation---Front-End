import {
  Ticket,
  Clock,
  LoaderCircle,
  CheckCircle2,
  Archive,
  AlertTriangle,
} from "lucide-react";

import type {
  AdminTicketStatistics,
} from "../../../types/adminTicket.types";

interface AdminTicketStatsProps {
  stats: AdminTicketStatistics;
}

const AdminTicketStats = ({
  stats,
}: AdminTicketStatsProps) => {
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
      title: "Urgent Tickets",
      value: stats.urgent,
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
          <div
            key={card.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">
                {card.title}
              </p>

              <div className={`rounded-xl p-3 ${card.background} ${card.color}`}>
                <Icon size={23} />
              </div>
            </div>

            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {card.value.toLocaleString()}
            </h3>
          </div>
        );
      })}
    </div>
  );
};

export default AdminTicketStats;