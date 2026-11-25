
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { apiClient } from "../../api/client";
import type { Ticket } from "../../api/tickets.api";

interface TicketListResponse {
  items: Ticket[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

const PAGE_SIZE = 10;

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTickets = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");

      try {
        const response =
          await apiClient.get<TicketListResponse>("/tickets", {
            params: {
              page,
              limit: PAGE_SIZE,
              ...(search.trim() && { search: search.trim() }),
              ...(status && { status }),
              ...(priority && { priority }),
            },
            signal,
          });

        if (signal?.aborted) return;

        setTickets(response.data.items);
        setTotal(response.data.total);
        setTotalPages(
          Math.max(1, response.data.total_pages)
        );
      } catch (err) {
        if (axios.isCancel(err) || signal?.aborted) return;

        setTickets([]);
        setTotal(0);

        setError(
          axios.isAxiosError(err)
            ? typeof err.response?.data?.detail === "string"
              ? err.response.data.detail
              : `Failed to load tickets (${err.response?.status ?? "network error"}).`
            : "Unable to load tickets."
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page, search, status, priority]
  );

  useEffect(() => {
    const controller = new AbortController();

    // Debounce searches to reduce API requests.
    const timer = window.setTimeout(() => {
      void loadTickets(controller.signal);
    }, search ? 350 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loadTickets, search]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  function handlePriority(value: string) {
    setPriority(value);
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Ticket Inbox
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Search and manage customer support tickets.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadTickets()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Refresh
          </button>
        </div>

        <div className="grid gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-3">
          <div>
            <label
              htmlFor="ticket-search"
              className="mb-2 block text-sm font-medium"
            >
              Search Tickets
            </label>

            <input
              id="ticket-search"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by subject..."
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="ticket-status"
              className="mb-2 block text-sm font-medium"
            >
              Status
            </label>

            <select
              id="ticket-status"
              value={status}
              onChange={(e) => handleStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ticket-priority"
              className="mb-2 block text-sm font-medium"
            >
              Priority
            </label>

            <select
              id="ticket-priority"
              value={priority}
              onChange={(e) => handlePriority(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-slate-500">
              Loading tickets...
            </p>
          ) : tickets.length === 0 ? (
            <p className="p-8 text-center text-slate-500">
              No tickets found.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-4">Ticket</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t">
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {ticket.subject ?? ticket.title ?? "Untitled"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Ticket #{ticket.id}
                      </p>
                    </td>

                    <td className="px-5 py-4 capitalize">
                      {ticket.status?.replaceAll("_", " ") ?? "-"}
                    </td>

                    <td className="px-5 py-4 capitalize">
                      {ticket.priority ?? "-"}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Total tickets: {total}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={loading || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border bg-white px-4 py-2 disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={loading || page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border bg-white px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
