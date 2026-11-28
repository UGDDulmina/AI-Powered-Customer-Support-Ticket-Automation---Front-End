import { useEffect, useState } from "react";

import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  LoaderCircle,
  Ticket,
  Filter,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

import { getMyTickets } from "../api/agentTickets.api";

import AgentTicketFilters from "../components/agent/tickets/AgentTicketFilters";

import AgentTicketTable from "../components/agent/tickets/AgentTicketTable";

import { getApiErrorMessage } from "../utils/apiError";

import type {
  AgentTicketFilters as Filters,
  AgentTicketListResponse,
  AgentTicketQuery,
} from "../types/agentTicket.types";

const PAGE_SIZE = 10;

const INITIAL_FILTERS: Filters = {
  search: "",
  status: "all",
  priority: "all",
};

interface ContentProps {
  agentId: number;
}

const AgentTicketsContent = ({
  agentId,
}: ContentProps) => {
  const [filters, setFilters] =
    useState<Filters>(INITIAL_FILTERS);

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [page, setPage] = useState(1);

  const [data, setData] =
    useState<AgentTicketListResponse | null>(null);

  const [totalAssigned, setTotalAssigned] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [filters.search]);

  useEffect(() => {
    const controller = new AbortController();

    setTotalAssigned(null);

    getMyTickets(
      agentId,
      { page: 1, limit: 1 },
      controller.signal
    )
      .then((result) => {
        if (!controller.signal.aborted) {
          setTotalAssigned(result.total);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setTotalAssigned(null);
        }
      });

    return () => controller.abort();
  }, [agentId, refreshKey]);

  useEffect(() => {
    if (filters.search.trim() !== debouncedSearch) {
      setLoading(true);
      return;
    }

    const controller = new AbortController();

    const loadTickets = async () => {
      setLoading(true);
      setError("");

      const query: AgentTicketQuery = {
        page,
        limit: PAGE_SIZE,
      };

      if (debouncedSearch) {
        query.search = debouncedSearch;
      }

      if (filters.status !== "all") {
        query.status = filters.status;
      }

      if (filters.priority !== "all") {
        query.priority = filters.priority;
      }

      try {
        const result = await getMyTickets(
          agentId,
          query,
          controller.signal
        );

        if (controller.signal.aborted) {
          return;
        }

        const lastPage = Math.max(
          1,
          result.total_pages
        );

        if (page > lastPage) {
          setPage(lastPage);
          return;
        }

        setData(result);
        setLastUpdated(new Date());
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setData(null);
          setError(getApiErrorMessage(error));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadTickets();

    return () => controller.abort();
  }, [
    agentId,
    page,
    debouncedSearch,
    filters.search,
    filters.status,
    filters.priority,
    refreshKey,
  ]);

  const handleFilterChange = (
    nextFilters: Filters
  ) => {
    setLoading(true);
    setPage(1);
    setFilters(nextFilters);
  };

  const handleClearFilters = () => {
    setLoading(true);
    setPage(1);
    setFilters(INITIAL_FILTERS);
  };

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey((previous) => previous + 1);
  };

  const hasFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.priority !== "all";

  const totalPages = Math.max(
    1,
    data?.total_pages ?? 1
  );

  const firstItem =
    data && data.total > 0
      ? (data.page - 1) * data.limit + 1
      : 0;

  const lastItem = data
    ? (data.page - 1) * data.limit +
      data.item.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Tickets
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage your assigned support tickets.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-blue-100 p-3">
            <Ticket className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Total Assigned Tickets
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {totalAssigned ?? "Unavailable"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-purple-100 p-3">
            <Filter className="h-6 w-6 text-purple-600" />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Matching Tickets
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {loading
                ? "Loading..."
                : data?.total ?? "Unavailable"}
            </p>
          </div>
        </div>
      </div>

      <AgentTicketFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {error && !loading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <h3 className="font-semibold text-red-800">
                Unable to load tickets
              </h3>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

              <button
                onClick={handleRefresh}
                className="mt-3 text-sm font-semibold text-red-700 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white">
          <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />

          <p className="mt-3 text-sm text-gray-500">
            Loading your tickets...
          </p>
        </div>
      ) : (
        !error &&
        data && (
          <>
            <AgentTicketTable
              tickets={data.item}
              hasFilters={hasFilters}
            />

            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 sm:flex-row">
              <p className="text-sm text-gray-500">
                Showing {firstItem} to {lastItem} of{" "}
                {data.total} tickets
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={
                    loading || !data.has_previous
                  }
                  onClick={() => {
                    setLoading(true);
                    setPage((previous) =>
                      Math.max(1, previous - 1)
                    );
                  }}
                  className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="text-sm font-medium text-gray-700">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  aria-label="Next page"
                  disabled={
                    loading || !data.has_next
                  }
                  onClick={() => {
                    setLoading(true);
                    setPage((previous) => previous + 1);
                  }}
                  className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )
      )}

      {lastUpdated && !error && !loading && (
        <p className="text-right text-xs text-gray-400">
          Last updated:{" "}
          {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

const AgentTicketsPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || user.role !== "agent") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        You do not have permission to access this page.
      </div>
    );
  }

  return (
    <AgentTicketsContent
      key={user.id}
      agentId={user.id}
    />
  );
};

export default AgentTicketsPage;