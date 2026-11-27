import { Link } from "react-router-dom";

import {
  Ticket,
  ExternalLink,
  UserRound,
  CalendarDays,
} from "lucide-react";

import type {
  AdminTicket,
  AdminTicketLookups,
  TicketStatus,
  TicketPriority,
} from "../../../types/adminTicket.types";

interface AdminTicketTableProps {
  tickets: AdminTicket[];
  lookups: AdminTicketLookups;
  hasFilters: boolean;
}

const statusStyles: Record<TicketStatus, string> = {
  open: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-700",
};

const priorityStyles: Record<TicketPriority, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const formatLabel = (value: string): string =>
  value.replace(/_/g, " ");

const formatDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const AdminTicketTable = ({
  tickets,
  lookups,
  hasFilters,
}: AdminTicketTableProps) => {
  const customerMap = new Map(
    lookups.customers.map((customer) => [
      customer.id,
      customer,
    ])
  );

  const agentMap = new Map(
    lookups.agents.map((agent) => [
      agent.id,
      agent,
    ])
  );

  if (tickets.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">

        <Ticket
          size={46}
          className="mb-4 text-slate-300"
        />

        <h3 className="font-semibold text-slate-700">
          {hasFilters
            ? "No matching tickets"
            : "No support tickets"}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {hasFilters
            ? "Try changing your search or filters."
            : "Support tickets will appear here."}
        </p>

      </div>
    );
  }

  return (
    <div className="overflow-x-auto">

      <table className="w-full text-left text-sm">

        <thead className="bg-slate-50 text-xs uppercase text-slate-500">

          <tr>
            <th className="px-5 py-4">Ticket ID</th>
            <th className="px-5 py-4">Subject</th>
            <th className="px-5 py-4">Customer</th>
            <th className="px-5 py-4">Assigned Agent</th>
            <th className="px-5 py-4">Category</th>
            <th className="px-5 py-4">Priority</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Created Date</th>
            <th className="px-5 py-4">Action</th>
          </tr>

        </thead>

        <tbody className="divide-y divide-slate-100">

          {tickets.map((ticket) => {
            const customer =
              ticket.customer_id != null
                ? customerMap.get(ticket.customer_id)
                : undefined;

            const agent =
              ticket.assigned_agent_id != null
                ? agentMap.get(ticket.assigned_agent_id)
                : undefined;

            const customerName =
              customer?.name ||
              ticket.customer_name ||
              (
                ticket.customer_id != null
                  ? `Customer #${ticket.customer_id}`
                  : "No customer"
              );

            const agentName =
              agent?.name ||
              ticket.assigned_agent_name ||
              (
                ticket.assigned_agent_id != null
                  ? `Agent #${ticket.assigned_agent_id}`
                  : "Unassigned"
              );

            return (
              <tr
                key={ticket.id}
                className="transition-colors hover:bg-slate-50"
              >

                <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-600">
                  #{ticket.id}
                </td>

                <td className="min-w-56 px-5 py-4">

                  <Link
                    to={`/admin/tickets/${ticket.id}`}
                    className="font-semibold text-slate-800 hover:text-blue-600"
                  >
                    {ticket.subject}
                  </Link>

                </td>

                <td className="min-w-44 px-5 py-4">

                  {ticket.customer_id != null ? (
                    <Link
                      to={`/admin/customers/${ticket.customer_id}`}
                      className="font-medium text-slate-700 hover:text-blue-600"
                    >
                      {customerName}
                    </Link>
                  ) : (
                    <span className="text-slate-400">
                      {customerName}
                    </span>
                  )}

                  {customer?.email && (
                    <p className="mt-1 text-xs text-slate-400">
                      {customer.email}
                    </p>
                  )}

                </td>

                <td className="min-w-44 px-5 py-4">

                  {ticket.assigned_agent_id != null ? (
                    <div>

                      <div className="flex items-center gap-2 text-slate-600">

                        <UserRound
                          size={16}
                          className="text-slate-400"
                        />

                        {agentName}

                      </div>

                      {agent && !agent.is_active && (
                        <span className="mt-1 inline-block text-xs font-medium text-amber-600">
                          Inactive account
                        </span>
                      )}

                    </div>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      Unassigned
                    </span>
                  )}

                </td>

                <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                  {ticket.category || "Uncategorized"}
                </td>

                <td className="whitespace-nowrap px-5 py-4">

                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    priorityStyles[ticket.priority] ??
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {formatLabel(ticket.priority)}
                  </span>

                </td>

                <td className="whitespace-nowrap px-5 py-4">

                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    statusStyles[ticket.status] ??
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {formatLabel(ticket.status)}
                  </span>

                </td>

                <td className="whitespace-nowrap px-5 py-4">

                  <div className="flex items-center gap-2 text-slate-500">

                    <CalendarDays
                      size={16}
                      className="text-slate-400"
                    />

                    {formatDate(ticket.created_at)}

                  </div>

                </td>

                <td className="whitespace-nowrap px-5 py-4">

                  <Link
                    to={`/admin/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  >
                    <ExternalLink size={15} />
                    View Ticket
                  </Link>

                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

    </div>
  );
};

export default AdminTicketTable;