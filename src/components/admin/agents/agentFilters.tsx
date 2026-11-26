import {
  Search,
  X,
  Filter,
} from "lucide-react";

import type {
  AgentStatusFilter,
} from "../../../types/agent.types";

interface AgentFiltersProps {
  search: string;
  status: AgentStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AgentStatusFilter) => void;
  onClear: () => void;
}

const AgentFilters = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onClear,
}: AgentFiltersProps) => {

  const hasFilters =
    search.length > 0 || status !== "all";

  return (

    <div className="flex flex-col gap-3
                    border-b border-slate-100
                    p-5 lg:flex-row">

      {/* Search input */}

      <div className="relative flex-1">

        <Search
          size={18}
          className="absolute left-3 top-1/2
                     -translate-y-1/2
                     text-slate-400"
        />

        <input
          type="text"
          aria-label="Search agents"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search by name, email or ID..."
          className="w-full rounded-lg border
                     border-slate-200 bg-white
                     py-2.5 pl-10 pr-10
                     text-sm outline-none
                     focus:border-blue-500
                     focus:ring-2
                     focus:ring-blue-100"
        />

        {search && (

          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2
                       -translate-y-1/2
                       text-slate-400
                       hover:text-slate-700"
          >

            <X size={16} />

          </button>

        )}

      </div>


      {/* Status filter */}

      <div className="flex items-center gap-2
                      rounded-lg border
                      border-slate-200
                      bg-white px-3">

        <Filter
          size={17}
          className="text-slate-400"
        />

        <select
          aria-label="Filter by account status"
          value={status}
          onChange={(event) =>
            onStatusChange(
              event.target.value as AgentStatusFilter
            )
          }
          className="w-full bg-transparent
                     py-2.5 text-sm
                     text-slate-700 outline-none"
        >

          <option value="all">
            All Statuses
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>

        </select>

      </div>


      {/* Clear filters */}

      {hasFilters && (

        <button
          type="button"
          onClick={onClear}
          className="flex items-center
                     justify-center gap-2
                     rounded-lg border
                     border-slate-200
                     px-4 py-2.5 text-sm
                     text-slate-600
                     hover:bg-slate-50"
        >

          <X size={16} />

          Clear Filters

        </button>

      )}

    </div>

  );

};

export default AgentFilters;