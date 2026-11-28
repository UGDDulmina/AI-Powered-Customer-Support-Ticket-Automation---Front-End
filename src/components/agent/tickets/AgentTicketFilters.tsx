import { Search, X, FilterX } from "lucide-react";

import type {
  AgentTicketFilters as Filters,
  AgentTicketStatusFilter,
  AgentTicketPriorityFilter,
} from "../../../types/agentTicket.types";

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
}

const AgentTicketFilters = ({
  filters,
  onChange,
  onClear,
}: Props) => {
  const hasFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.priority !== "all";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="xl:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Search Tickets
          </label>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />

            <input
              type="text"
              aria-label="Search tickets"
              placeholder="Search by subject..."
              value={filters.search}
              onChange={(event) =>
                onChange({
                  ...filters,
                  search: event.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {filters.search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() =>
                  onChange({
                    ...filters,
                    search: "",
                  })
                }
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="agent-ticket-status"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Status
          </label>

          <select
            id="agent-ticket-status"
            value={filters.status}
            onChange={(event) =>
              onChange({
                ...filters,
                status: event.target
                  .value as AgentTicketStatusFilter,
              })
            }
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="agent-ticket-priority"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Priority
          </label>

          <select
            id="agent-ticket-priority"
            value={filters.priority}
            onChange={(event) =>
              onChange({
                ...filters,
                priority: event.target
                  .value as AgentTicketPriorityFilter,
              })
            }
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {hasFilters && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <FilterX size={16} />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AgentTicketFilters;