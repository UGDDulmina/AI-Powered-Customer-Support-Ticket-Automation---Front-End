import {
  Search,
  X,
  Filter,
  Users,
  UserRound,
} from "lucide-react";

import type {
  AdminTicketFilterState,
  AdminTicketLookups,
  TicketStatusFilter,
} from "../../../types/adminTicket.types";

interface AdminTicketFiltersProps {
  filters: AdminTicketFilterState;
  lookups: AdminTicketLookups;
  lookupsLoading: boolean;
  onChange: (filters: AdminTicketFilterState) => void;
  onClear: () => void;
}

const AdminTicketFilters = ({
  filters,
  lookups,
  lookupsLoading,
  onChange,
  onClear,
}: AdminTicketFiltersProps) => {
  const hasFilters =
    Boolean(filters.search.trim()) ||
    filters.status !== "all" ||
    filters.customerId !== "all" ||
    filters.agentId !== "all";

  const selectClass =
    "w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-100";

  return (
    <div className="space-y-4 border-b border-slate-100 p-5">

      <div className="flex flex-col gap-3 sm:flex-row">

        <div className="relative flex-1">

          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={filters.search}
            aria-label="Search tickets"
            placeholder="Search tickets..."
            onChange={(event) =>
              onChange({
                ...filters,
                search: event.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          )}

        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            <X size={17} />
            Clear Filters
          </button>
        )}

      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

        <div className="relative">

          <Filter
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <select
            value={filters.status}
            aria-label="Filter by status"
            onChange={(event) =>
              onChange({
                ...filters,
                status: event.target.value as TicketStatusFilter,
              })
            }
            className={selectClass}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

        </div>

        <div className="relative">

          <Users
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <select
            value={filters.customerId}
            disabled={lookupsLoading}
            aria-label="Filter by customer"
            onChange={(event) =>
              onChange({
                ...filters,
                customerId: event.target.value,
              })
            }
            className={selectClass}
          >
            <option value="all">All Customers</option>

            {lookups.customers.map((customer) => (
              <option
                key={customer.id}
                value={customer.id}
              >
                {customer.name} (#{customer.id})
              </option>
            ))}
          </select>

        </div>

        <div className="relative">

          <UserRound
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <select
            value={filters.agentId}
            disabled={lookupsLoading}
            aria-label="Filter by assigned agent"
            onChange={(event) =>
              onChange({
                ...filters,
                agentId: event.target.value,
              })
            }
            className={selectClass}
          >
            <option value="all">All Agents</option>

            {lookups.agents.map((agent) => (
              <option
                key={agent.id}
                value={agent.id}
              >
                {agent.name}
                {!agent.is_active ? " (Inactive)" : ""}
                {` (#${agent.id})`}
              </option>
            ))}
          </select>

        </div>

      </div>

    </div>
  );
};

export default AdminTicketFilters;