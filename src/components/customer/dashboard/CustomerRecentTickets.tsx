import { Link } from "react-router-dom";

import {
  Ticket,
  ArrowRight,
  PlusCircle,
} from "lucide-react";

import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_STATUS_STYLES,
  CUSTOMER_PRIORITY_STYLES,
} from "../../../types/customerDashboard.types";

import type {
  CustomerRecentTicket,
} from "../../../types/customerDashboard.types";

interface CustomerRecentTicketsProps {
  tickets: CustomerRecentTicket[];
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CustomerRecentTickets({
  tickets,
}: CustomerRecentTicketsProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Recent Support Tickets
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Your latest support requests
          </p>
        </div>

        <Link
          to="/customer/tickets"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View All

          <ArrowRight size={15} />
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="rounded-full bg-blue-50 p-4">
            <Ticket
              size={32}
              className="text-blue-500"
            />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-gray-800">
            No Support Tickets Yet
          </h3>

          <p className="mt-2 max-w-xs text-sm text-gray-500">
            Submit your first support request
            and our team will assist you.
          </p>

          <Link
            to="/customer/tickets/create"
            className="mt-5 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusCircle size={16} />

            Create Ticket
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/customer/tickets/${ticket.id}`}
              className="flex items-center gap-4 p-5 transition hover:bg-gray-50"
            >
              <div className="hidden rounded-lg bg-gray-100 p-3 text-gray-500 sm:block">
                <Ticket size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-400">
                  Ticket #{ticket.id}
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                  {ticket.subject}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(ticket.created_at)}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    CUSTOMER_STATUS_STYLES[
                      ticket.status
                    ] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {CUSTOMER_STATUS_LABELS[
                    ticket.status
                  ] || ticket.status}
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                    CUSTOMER_PRIORITY_STYLES[
                      ticket.priority
                    ] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {ticket.priority}
                </span>
              </div>

              <ArrowRight
                size={16}
                className="hidden shrink-0 text-gray-400 sm:block"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}