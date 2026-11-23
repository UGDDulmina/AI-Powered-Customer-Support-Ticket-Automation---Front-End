
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTickets, type Ticket } from "../api/tickets.api";

export default function TicketsPage() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  
  async function loadTickets() {
    setLoading(true);
    setError("");

    try {
      const data = await getTickets();
      setTickets(data);
    } catch (err) {
      console.error("Failed to load tickets:", err);
      setError("Unable to load tickets from the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTickets();
  }, []);

  
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const subject = ticket.subject ?? ticket.title ?? "";

      const matchesSearch =
        subject.toLowerCase().includes(search.toLowerCase()) ||
        String(ticket.id).includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);


  const statuses = [
    ...new Set(
      tickets
        .map((ticket) => ticket.status)
        .filter((status): status is string => Boolean(status))
    ),
  ];

  
  function openTicket(ticketId: number) {
    navigate(`/tickets/${ticketId}`);
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">

        
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Ticket Inbox
            </h1>

            <p className="mt-1 text-slate-500">
              View and manage customer support tickets
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadTickets()}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh Tickets"}
          </button>
        </div>

        
        <div className="mb-6 flex flex-wrap gap-4 rounded-xl bg-white p-5 shadow-sm">
          <input
            type="text"
            placeholder="Search by subject or ticket ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-60 flex-1 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>

            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading tickets...
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="mb-4 text-red-600">{error}</p>

              <button
                type="button"
                onClick={() => void loadTickets()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                Try Again
              </button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No tickets found.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="p-4">Ticket ID</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Assigned Agent</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => openTicket(ticket.id)}
                    className="cursor-pointer border-b transition-colors hover:bg-blue-50"
                  >
                    <td className="p-4 font-medium text-blue-600">
                      #{ticket.id}
                    </td>

                    <td className="p-4 font-medium text-slate-800">
                      {ticket.subject ??
                        ticket.title ??
                        "Untitled Ticket"}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm capitalize text-slate-700">
                        {ticket.status ?? "Unknown"}
                      </span>
                    </td>

                    <td className="p-4 capitalize">
                      {ticket.priority ?? "Not set"}
                    </td>

                    <td className="p-4">
                      {ticket.customer_id ?? "-"}
                    </td>

                    <td className="p-4">
                      {ticket.assigned_agent_id ?? "Unassigned"}
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTicket(ticket.id);
                        }}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        
        <p className="mt-4 text-sm text-slate-500">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </p>

      </div>
    </div>
  );
}
