import {
  ArrowRight,
  ExternalLink,
  Ticket,
} from "lucide-react";

import { Link } from "react-router-dom";

import type {
  RecentTicket,
  DashboardTicketStatus,
  DashboardTicketPriority,
} from "../../../types/adminDashboard.types";


interface RecentTicketsTableProps {
  tickets: RecentTicket[];
}


const statusStyles: Record<
  DashboardTicketStatus,
  string
> = {
  open: "bg-amber-100 text-amber-700",

  in_progress: "bg-blue-100 text-blue-700",

  resolved: "bg-green-100 text-green-700",

  closed: "bg-slate-100 text-slate-700",
};


const priorityStyles: Record<
  DashboardTicketPriority,
  string
> = {
  low: "bg-green-100 text-green-700",

  medium: "bg-blue-100 text-blue-700",

  high: "bg-orange-100 text-orange-700",

  urgent: "bg-red-100 text-red-700",
};


const formatLabel = (value: string): string => {

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

};


const formatDate = (value: string): string => {

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

};


const RecentTicketsTable = ({
  tickets,
}: RecentTicketsTableProps) => {

  return (

    <section className="overflow-hidden
                        rounded-xl border
                        border-slate-200
                        bg-white shadow-sm">


      <div className="flex flex-wrap
                      items-center
                      justify-between gap-3
                      border-b border-slate-100
                      p-5">

        <div>

          <h2 className="text-lg font-semibold
                         text-slate-800">

            Recent Tickets

          </h2>

          <p className="mt-1 text-sm
                        text-slate-500">

            Latest customer support requests

          </p>

        </div>


        <Link
          to="/admin/tickets"
          className="flex items-center gap-2
                     text-sm font-medium
                     text-blue-600
                     hover:text-blue-800"
        >

          View all tickets

          <ArrowRight size={16} />

        </Link>

      </div>


      {tickets.length === 0 ? (

        <div className="flex min-h-52
                        flex-col items-center
                        justify-center p-6">

          <Ticket
            size={40}
            className="mb-3 text-slate-300"
          />

          <p className="font-medium
                        text-slate-700">

            No tickets available

          </p>

          <p className="mt-1 text-sm
                        text-slate-500">

            Customer support tickets will
            appear here.

          </p>

        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full text-left
                            text-sm">

            <thead className="bg-slate-50
                              text-xs
                              uppercase
                              text-slate-500">

              <tr>

                <th className="px-5 py-4">
                  Ticket ID
                </th>

                <th className="px-5 py-4">
                  Subject
                </th>

                <th className="px-5 py-4">
                  Priority
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

                <th className="px-5 py-4">
                  Assigned Agent
                </th>

                <th className="px-5 py-4">
                  Created
                </th>

                <th className="px-5 py-4">
                  Action
                </th>

              </tr>

            </thead>


            <tbody className="divide-y
                              divide-slate-100">

              {tickets.map((ticket) => (

                <tr
                  key={ticket.id}
                  className="transition-colors
                             hover:bg-slate-50"
                >


                  <td className="whitespace-nowrap
                                 px-5 py-4
                                 font-medium
                                 text-blue-600">

                    #{ticket.id}

                  </td>


                  <td className="min-w-48
                                 max-w-72
                                 px-5 py-4">

                    <p
                      className="truncate
                                 font-medium
                                 text-slate-800"
                      title={ticket.subject}
                    >

                      {ticket.subject}

                    </p>

                    {ticket.category && (

                      <p className="mt-1
                                    text-xs
                                    text-slate-500">

                        {formatLabel(
                          ticket.category
                        )}

                      </p>

                    )}

                  </td>


                  <td className="whitespace-nowrap
                                 px-5 py-4">

                    <span
                      className={`rounded-full
                                  px-3 py-1
                                  text-xs
                                  font-medium
                                  ${
                                    priorityStyles[
                                      ticket.priority
                                    ] ??
                                    "bg-slate-100 text-slate-700"
                                  }`}
                    >

                      {formatLabel(
                        ticket.priority
                      )}

                    </span>

                  </td>


                  <td className="whitespace-nowrap
                                 px-5 py-4">

                    <span
                      className={`rounded-full
                                  px-3 py-1
                                  text-xs
                                  font-medium
                                  ${
                                    statusStyles[
                                      ticket.status
                                    ] ??
                                    "bg-slate-100 text-slate-700"
                                  }`}
                    >

                      {formatLabel(
                        ticket.status
                      )}

                    </span>

                  </td>


                  <td className="whitespace-nowrap
                                 px-5 py-4
                                 text-slate-600">

                    {
                      ticket.assigned_agent_name ??
                      (
                        ticket.assigned_agent_id != null
                          ? `Agent #${ticket.assigned_agent_id}`
                          : "Unassigned"
                      )
                    }

                  </td>


                  <td className="whitespace-nowrap
                                 px-5 py-4
                                 text-slate-500">

                    {formatDate(
                      ticket.created_at
                    )}

                  </td>


                  <td className="px-5 py-4">

                    <Link
                      to={`/admin/tickets/${ticket.id}`}
                      aria-label={`View ticket ${ticket.id}`}
                      className="inline-flex
                                 rounded-lg
                                 bg-blue-50
                                 p-2
                                 text-blue-600
                                 hover:bg-blue-100"
                    >

                      <ExternalLink size={17} />

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


export default RecentTicketsTable;