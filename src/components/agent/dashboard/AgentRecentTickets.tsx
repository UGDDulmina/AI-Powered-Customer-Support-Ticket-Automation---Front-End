import {
  ArrowRight,
  Ticket,
  AlertTriangle,
} from "lucide-react";

import { Link } from "react-router-dom";

import type {
  AdminTicket,
  TicketStatus,
  TicketPriority,
} from "../../../types/adminTicket.types";

interface AgentRecentTicketsProps {
  tickets: AdminTicket[];
  urgentOnly?: boolean;
}

const statusLabels: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const statusColors: Record<TicketStatus, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-600",
};

const priorityColors: Record<TicketPriority, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const AgentRecentTickets = ({
  tickets,
  urgentOnly = false,
}: AgentRecentTicketsProps) => {
  const SectionIcon = urgentOnly
    ? AlertTriangle
    : Ticket;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-xl p-3 ${
              urgentOnly
                ? "bg-red-50 text-red-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <SectionIcon size={22} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-800">
              {urgentOnly
                ? "Urgent Tickets Requiring Attention"
                : "Recent Tickets"}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {urgentOnly
                ? "Up to five active urgent tickets"
                : "Latest created tickets assigned to you"}
            </p>
          </div>
        </div>

        <Link
          to="/agent/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View All Tickets
          <ArrowRight size={16} />
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
          <SectionIcon
            size={40}
            className="mb-4 text-slate-300"
          />

          <h4 className="font-medium text-slate-700">
            {urgentOnly
              ? "No active urgent tickets"
              : "No assigned tickets"}
          </h4>

          <p className="mt-2 text-sm text-slate-500">
            {urgentOnly
              ? "You currently have no urgent tickets requiring attention."
              : "Your assigned support tickets will appear here."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4">Ticket ID</th>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created Date</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700">
                    #{ticket.id}
                  </td>

                  <td className="max-w-xs px-5 py-4">
                    <Link
                      to={`/agent/tickets/${ticket.id}`}
                      className="block truncate text-sm font-medium text-slate-800 hover:text-blue-600"
                      title={ticket.subject}
                    >
                      {ticket.subject}
                    </Link>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {ticket.category || "Uncategorized"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${priorityColors[ticket.priority]}`}
                    >
                      {ticket.priority}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusColors[ticket.status]}`}
                    >
                      {statusLabels[ticket.status]}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                    {formatDate(ticket.created_at)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <Link
                      to={`/agent/tickets/${ticket.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View
                      <ArrowRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AgentRecentTickets;