import { Link } from "react-router-dom";
import { ArrowRight, Ticket } from "lucide-react";

import type { AgentTicket } from "../../../types/agentTicket.types";

import type {
  TicketStatus,
  TicketPriority,
} from "../../../types/adminTicket.types";

interface Props {
  tickets: AgentTicket[];
  hasFilters: boolean;
}

const statusStyles: Record<TicketStatus, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

const priorityStyles: Record<TicketPriority, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const formatLabel = (value: string) =>
  value
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");

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

const AgentTicketTable = ({
  tickets,
  hasFilters,
}: Props) => {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-4">
          <Ticket className="h-8 w-8 text-gray-400" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900">
          {hasFilters
            ? "No matching tickets"
            : "No assigned tickets"}
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          {hasFilters
            ? "Try changing your search or filters."
            : "Tickets assigned to you will appear here."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-4">Ticket ID</th>
              <th className="px-5 py-4">Subject</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Priority</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Created</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="transition-colors hover:bg-gray-50"
              >
                <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-600">
                  #{ticket.id}
                </td>

                <td className="max-w-xs px-5 py-4">
                  <Link
                    to={`/agent/tickets/${ticket.id}`}
                    className="font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {ticket.subject}
                  </Link>

                  {ticket.description && (
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {ticket.description}
                    </p>
                  )}
                </td>

                <td className="px-5 py-4 text-gray-600">
                  {ticket.category
                    ? formatLabel(ticket.category)
                    : "Uncategorized"}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      priorityStyles[ticket.priority]
                    }`}
                  >
                    {formatLabel(ticket.priority)}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      statusStyles[ticket.status]
                    }`}
                  >
                    {formatLabel(ticket.status)}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                  {formatDate(ticket.created_at)}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <Link
                    to={`/agent/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 font-medium text-blue-600 hover:bg-blue-100"
                  >
                    View Ticket
                    <ArrowRight size={15} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentTicketTable;