import {
  useState,
  useEffect,
} from "react";

import {
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";

import {
  getAdminTickets,
  getAdminTicketStatistics,
  getAdminTicketLookups,
} from "../api/adminTickets.api";

import type {
  AdminTicketListResponse,
  AdminTicketStatistics,
  AdminTicketLookups,
  AdminTicketFilterState,
  AdminTicketQuery,
} from "../types/adminTicket.types";

import AdminTicketStats from
  "../components/admin/tickets/AdminTicketStats";

import AdminTicketFilters from
  "../components/admin/tickets/AdminTicketFilters";

import AdminTicketTable from
  "../components/admin/tickets/AdminTicketTable";

import {
  getApiErrorMessage,
} from "../utils/apiError";

const PAGE_SIZE = 10;

const initialFilters: AdminTicketFilterState = {
  search: "",
  status: "all",
  customerId: "all",
  agentId: "all",
};

const initialLookups: AdminTicketLookups = {
  customers: [],
  agents: [],
};

const AdminTicketsPage = () => {
  const [tickets, setTickets] =
    useState<AdminTicketListResponse | null>(null);

  const [stats, setStats] =
    useState<AdminTicketStatistics | null>(null);

  const [lookups, setLookups] =
    useState<AdminTicketLookups>(initialLookups);

  const [filters, setFilters] =
    useState<AdminTicketFilterState>(initialFilters);

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [page, setPage] = useState(1);

  const [refreshKey, setRefreshKey] = useState(0);

  const [ticketRetryKey, setTicketRetryKey] =
    useState(0);

  const [ticketsLoading, setTicketsLoading] =
    useState(true);

  const [statsLoading, setStatsLoading] =
    useState(true);

  const [lookupsLoading, setLookupsLoading] =
    useState(true);

  const [ticketsError, setTicketsError] =
    useState("");

  const [statsError, setStatsError] =
    useState("");

  const [lookupsError, setLookupsError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [filters.search]);

  useEffect(() => {
    const controller = new AbortController();

    const loadStats = async () => {
      setStatsLoading(true);
      setStatsError("");

      try {
        const data = await getAdminTicketStatistics(
          controller.signal
        );

        if (!controller.signal.aborted) {
          setStats(data);
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setStatsError(getApiErrorMessage(error));
        }
      } finally {
        if (!controller.signal.aborted) {
          setStatsLoading(false);
        }
      }
    };

    const loadLookups = async () => {
      setLookupsLoading(true);
      setLookupsError("");

      try {
        const data = await getAdminTicketLookups(
          controller.signal
        );

        if (!controller.signal.aborted) {
          setLookups(data);
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setLookupsError(getApiErrorMessage(error));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLookupsLoading(false);
        }
      }
    };

    void loadStats();
    void loadLookups();

    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  useEffect(() => {
    const controller = new AbortController();

    const loadTickets = async () => {
      setTicketsLoading(true);
      setTicketsError("");

      const query: AdminTicketQuery = {
        page,
        limit: PAGE_SIZE,
      };

      if (debouncedSearch) {
        query.search = debouncedSearch;
      }

      if (filters.status !== "all") {
        query.status = filters.status;
      }

      if (filters.customerId !== "all") {
        query.customer_id = Number(filters.customerId);
      }

      if (filters.agentId !== "all") {
        query.assigned_agent_id = Number(filters.agentId);
      }

      try {
        const data = await getAdminTickets(
          query,
          controller.signal
        );

        if (controller.signal.aborted) {
          return;
        }

        const lastPage = Math.max(
          1,
          data.total_pages
        );

        if (page > lastPage) {
          setPage(lastPage);
          return;
        }

        setTickets(data);
        setLastUpdated(new Date());
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setTicketsError(getApiErrorMessage(error));
        }
      } finally {
        if (!controller.signal.aborted) {
          setTicketsLoading(false);
        }
      }
    };

    if (filters.search.trim() !== debouncedSearch) {
      setTicketsLoading(true);

      return () => {
        controller.abort();
      };
    }

    void loadTickets();

    return () => {
      controller.abort();
    };
  }, [
    page,
    debouncedSearch,
    filters.search,
    filters.status,
    filters.customerId,
    filters.agentId,
    refreshKey,
    ticketRetryKey,
  ]);

  const handleFiltersChange = (
    value: AdminTicketFilterState
  ) => {
    setFilters(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setDebouncedSearch("");
    setPage(1);
  };

  const handleRefresh = () => {
    setRefreshKey((previous) => previous + 1);
  };

  const handleRetryTickets = () => {
    setTicketRetryKey((previous) => previous + 1);
  };

  const hasFilters =
    Boolean(filters.search.trim()) ||
    filters.status !== "all" ||
    filters.customerId !== "all" ||
    filters.agentId !== "all";

  const refreshing =
    ticketsLoading ||
    statsLoading ||
    lookupsLoading;

  const records = tickets?.item ?? [];

  const total = tickets?.total ?? 0;

  const currentPage = tickets?.page ?? 1;

  const totalPages = Math.max(
    1,
    tickets?.total_pages ?? 1
  );

  const startIndex =
    records.length === 0
      ? 0
      : (currentPage - 1) * (tickets?.limit ?? PAGE_SIZE) + 1;

  const endIndex =
    records.length === 0
      ? 0
      : startIndex + records.length - 1;

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-slate-900">
            Ticket Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor and manage all customer support tickets.
          </p>

          {lastUpdated && (
            <p className="mt-2 text-xs text-slate-400">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}

        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >

          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Loading..." : "Refresh"}

        </button>

      </div>

      {statsError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >

          <AlertCircle
            size={20}
            className="shrink-0"
          />

          <span>
            Unable to load ticket statistics: {statsError}
            {stats && ". Showing the last available statistics."}
          </span>

        </div>
      )}

      {statsLoading && !stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
            />
          ))}

        </div>
      )}

      {stats && (
        <AdminTicketStats stats={stats} />
      )}

      {lookupsError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >

          <AlertCircle
            size={20}
            className="shrink-0"
          />

          <span>
            Customer or agent information could not be loaded.
            Some names and filter options may be unavailable.
            {` ${lookupsError}`}
          </span>

        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 p-5">

          <h2 className="text-lg font-semibold text-slate-800">
            All Support Tickets
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Search, filter and view customer support requests.
          </p>

        </div>

        <AdminTicketFilters
          filters={filters}
          lookups={lookups}
          lookupsLoading={lookupsLoading}
          onChange={handleFiltersChange}
          onClear={handleClearFilters}
        />

        {ticketsLoading ? (

          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">

            <LoaderCircle
              size={25}
              className="animate-spin text-blue-600"
            />

            Loading support tickets...

          </div>

        ) : ticketsError ? (

          <div
            role="alert"
            className="flex min-h-64 flex-col items-center justify-center p-8 text-center"
          >

            <AlertCircle
              size={42}
              className="mb-4 text-red-500"
            />

            <h3 className="font-semibold text-slate-800">
              Unable to load tickets
            </h3>

            <p className="mt-2 text-sm text-red-600">
              {ticketsError}
            </p>

            <button
              type="button"
              onClick={handleRetryTickets}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try Again
            </button>

          </div>

        ) : (

          <AdminTicketTable
            tickets={records}
            lookups={lookups}
            hasFilters={hasFilters}
          />

        )}

        {!ticketsLoading && !ticketsError && tickets && (

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 p-5">

            <p className="text-sm text-slate-500">
              Showing {startIndex} to {endIndex} of {total} tickets
            </p>

            <div className="flex items-center gap-3">

              <button
                type="button"
                disabled={!tickets.has_previous}
                onClick={() =>
                  setPage(Math.max(1, currentPage - 1))
                }
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
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
                  setPage(currentPage + 1)
                }
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >

                Next

                <ChevronRight size={16} />

              </button>

            </div>

          </div>

        )}

      </section>

    </div>
  );
};

export default AdminTicketsPage;