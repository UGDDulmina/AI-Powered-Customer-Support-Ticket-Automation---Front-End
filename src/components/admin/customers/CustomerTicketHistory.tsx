import {
  Ticket,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

import type {
  CustomerTicketListResponse,
  CustomerTicketStatus,
  CustomerTicketPriority,
  CustomerTicketStatusFilter,
} from "../../../types/customer.types";

interface CustomerTicketHistoryProps {
  tickets: CustomerTicketListResponse | null;
  status: CustomerTicketStatusFilter;
  loading: boolean;
  error: string;
  onStatusChange: (
    status: CustomerTicketStatusFilter
  ) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

const statusStyles: Record<CustomerTicketStatus, string> = {
  open: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-700",
};

const priorityStyles: Record<CustomerTicketPriority, string> = {
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

const CustomerTicketHistory = ({
  tickets,
  status,
  loading,
  error,
  onStatusChange,
  onPageChange,
  onRetry,
}: CustomerTicketHistoryProps) => {
  const records = tickets?.item ?? [];

  const currentPage = tickets?.page ?? 1;

  const totalPages = Math.max(
    1,
    tickets?.total_pages ?? 1
  );

  const total = tickets?.total ?? 0;

  const startIndex =
    records.length === 0
      ? 0
      : (currentPage - 1) * (tickets?.limit ?? 10) + 1;

  const endIndex =
    records.length === 0
      ? 0
      : startIndex + records.length - 1;

  return (
    <section className="overflow-hidden rounded-xl
                        border border-slate-200
                        bg-white shadow-sm">

      <div className="flex flex-wrap items-center
                      justify-between gap-4
                      border-b border-slate-100 p-5">

        <div>

          <h2 className="text-lg font-semibold text-slate-800">
            Ticket History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Support tickets associated with this customer.
          </p>

        </div>

        <div className="relative">

          <Filter
            size={17}
            className="pointer-events-none absolute
                       left-3 top-1/2 -translate-y-1/2
                       text-slate-400"
          />

          <select
            value={status}
            aria-label="Filter tickets by status"
            onChange={(event) =>
              onStatusChange(
                event.target.value as CustomerTicketStatusFilter
              )
            }
            className="rounded-lg border border-slate-200
                       bg-white py-2.5 pl-10 pr-8
                       text-sm text-slate-700 outline-none
                       focus:border-blue-500"
          >

            <option value="all">All Statuses</option>

            <option value="open">Open</option>

            <option value="in_progress">In Progress</option>

            <option value="resolved">Resolved</option>

            <option value="closed">Closed</option>

          </select>

        </div>

      </div>

      {loading ? (

        <div className="flex min-h-48 items-center
                        justify-center gap-3
                        text-sm text-slate-500">

          <LoaderCircle
            size={23}
            className="animate-spin text-blue-600"
          />

          Loading customer tickets...

        </div>

      ) : error ? (

        <div
          role="alert"
          className="flex min-h-48 flex-col
                     items-center justify-center
                     p-6 text-center"
        >

          <AlertCircle
            size={36}
            className="mb-3 text-red-500"
          />

          <p className="font-medium text-slate-800">
            Unable to load ticket history
          </p>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-lg bg-blue-600
                       px-4 py-2 text-sm text-white
                       hover:bg-blue-700"
          >
            Try Again
          </button>

        </div>

      ) : records.length === 0 ? (

        <div className="flex min-h-48 flex-col
                        items-center justify-center
                        p-8 text-center">

          <Ticket
            size={44}
            className="mb-4 text-slate-300"
          />

          <h3 className="font-semibold text-slate-700">

            {status === "all"
              ? "No support tickets"
              : "No matching tickets"}

          </h3>

          <p className="mt-2 text-sm text-slate-500">

            {status === "all"
              ? "This customer does not have any support tickets."
              : "Try selecting another ticket status."}

          </p>

        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-slate-50 text-xs
                              uppercase text-slate-500">

              <tr>
                <th className="px-5 py-4">Ticket ID</th>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created Date</th>
                <th className="px-5 py-4">Action</th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {records.map((ticket) => (

                <tr
                  key={ticket.id}
                  className="hover:bg-slate-50"
                >

                  <td className="whitespace-nowrap
                                 px-5 py-4 font-medium
                                 text-slate-600">

                    #{ticket.id}

                  </td>

                  <td className="min-w-56 px-5 py-4">

                    <Link
                      to={`/admin/tickets/${ticket.id}`}
                      className="font-semibold text-slate-800
                                 hover:text-blue-600"
                    >

                      {ticket.subject}

                    </Link>

                  </td>

                  <td className="whitespace-nowrap
                                 px-5 py-4 text-slate-500">

                    {ticket.category || "Uncategorized"}

                  </td>

                  <td className="whitespace-nowrap px-5 py-4">

                    <span className={`rounded-full
                      px-3 py-1 text-xs font-medium capitalize
                      ${priorityStyles[ticket.priority] ??
                        "bg-slate-100 text-slate-600"}`}>

                      {formatLabel(ticket.priority)}

                    </span>

                  </td>

                  <td className="whitespace-nowrap px-5 py-4">

                    <span className={`rounded-full
                      px-3 py-1 text-xs font-medium capitalize
                      ${statusStyles[ticket.status] ??
                        "bg-slate-100 text-slate-600"}`}>

                      {formatLabel(ticket.status)}

                    </span>

                  </td>

                  <td className="whitespace-nowrap
                                 px-5 py-4 text-slate-500">

                    {formatDate(ticket.created_at)}

                  </td>

                  <td className="whitespace-nowrap px-5 py-4">

                    <Link
                      to={`/admin/tickets/${ticket.id}`}
                      className="inline-flex items-center
                                 gap-2 rounded-lg bg-blue-50
                                 px-3 py-2 text-xs font-medium
                                 text-blue-700 hover:bg-blue-100"
                    >

                      <ExternalLink size={15} />

                      View Ticket

                    </Link>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

      {!loading && !error && tickets && (

        <div className="flex flex-wrap items-center
                        justify-between gap-4
                        border-t border-slate-100 p-5">

          <p className="text-sm text-slate-500">

            Showing {startIndex} to {endIndex} of {total} tickets

          </p>

          <div className="flex items-center gap-3">

            <button
              type="button"
              disabled={!tickets.has_previous}
              onClick={() =>
                onPageChange(Math.max(1, currentPage - 1))
              }
              className="flex items-center gap-1 rounded-lg
                         border border-slate-200 px-3 py-2
                         text-sm text-slate-700
                         hover:bg-slate-50 disabled:opacity-40"
            >

              <ChevronLeft size={16} />

              Previous

            </button>

            <span className="text-sm font-medium text-slate-700">

              {currentPage} / {totalPages}

            </span>

            <button
              type="button"
              disabled={!tickets.has_next}
              onClick={() =>
                onPageChange(currentPage + 1)
              }
              className="flex items-center gap-1 rounded-lg
                         border border-slate-200 px-3 py-2
                         text-sm text-slate-700
                         hover:bg-slate-50 disabled:opacity-40"
            >

              Next

              <ChevronRight size={16} />

            </button>

          </div>

        </div>

      )}

    </section>
  );
};

export default CustomerTicketHistory;