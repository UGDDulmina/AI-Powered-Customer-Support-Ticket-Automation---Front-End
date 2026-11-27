import {
  Search,
  X,
  Filter,
} from "lucide-react";

import type {
  CustomerPhoneFilter,
} from "../../../types/customer.types";

interface CustomerFiltersProps {
  search: string;
  phoneFilter: CustomerPhoneFilter;
  onSearchChange: (value: string) => void;
  onPhoneFilterChange: (
    value: CustomerPhoneFilter
  ) => void;
  onClear: () => void;
}

const CustomerFilters = ({
  search,
  phoneFilter,
  onSearchChange,
  onPhoneFilterChange,
  onClear,
}: CustomerFiltersProps) => {

  const hasFilters =
    search.trim().length > 0 ||
    phoneFilter !== "all";

  return (
    <div className="flex flex-col gap-3
                    border-b border-slate-100
                    p-5 lg:flex-row
                    lg:items-center">

      <div className="relative flex-1">

        <Search
          size={19}
          className="absolute left-3 top-1/2
                     -translate-y-1/2
                     text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          aria-label="Search customers"
          placeholder="Search by name, email, phone or ID..."
          className="w-full rounded-lg border
                     border-slate-200 bg-white
                     py-2.5 pl-10 pr-10 text-sm
                     outline-none
                     focus:border-blue-500
                     focus:ring-2
                     focus:ring-blue-100"
        />

        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2
                       -translate-y-1/2
                       text-slate-400
                       hover:text-slate-700"
          >
            <X size={18} />
          </button>
        )}

      </div>

      <div className="relative">

        <Filter
          size={17}
          className="pointer-events-none
                     absolute left-3 top-1/2
                     -translate-y-1/2
                     text-slate-400"
        />

        <select
          value={phoneFilter}
          aria-label="Filter customers by phone"
          onChange={(event) =>
            onPhoneFilterChange(
              event.target.value as CustomerPhoneFilter
            )
          }
          className="w-full rounded-lg border
                     border-slate-200 bg-white
                     py-2.5 pl-10 pr-8 text-sm
                     text-slate-700 outline-none
                     focus:border-blue-500
                     lg:w-56"
        >

          <option value="all">
            All Customers
          </option>

          <option value="with_phone">
            With Phone Number
          </option>

          <option value="without_phone">
            Without Phone Number
          </option>

        </select>

      </div>

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

export default CustomerFilters;