import {
  useState,
  useEffect,
  useMemo,
} from "react";

import {
  History,
  Ticket,
  UserCheck,
  Users,
  RefreshCw,
  Flag,
  Clock,
  Search,
  ArrowRight,
  AlertCircle,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import {
  getTicketActivities,
} from "../../../api/ticketActivity.api";

import type {
  TicketActivity,
  TicketActivityAction,
  TicketActivityFilter,
  TicketActivitySort,
} from "../../../types/ticketActivity.types";

import {
  getApiErrorMessage,
} from "../../../utils/apiError";

interface TicketActivityTimelineProps {
  ticketId: number;
  refreshKey?: number;
}

const PAGE_SIZE = 10;

const activityConfig = {
  created: {
    label: "Ticket Created",
    description: "A new support ticket was created.",
    icon: Ticket,
    style: "bg-violet-100 text-violet-600",
  },
  assigned: {
    label: "Agent Assigned",
    description: "A support agent was assigned.",
    icon: UserCheck,
    style: "bg-blue-100 text-blue-600",
  },
  reassigned: {
    label: "Agent Reassigned",
    description: "The assigned support agent was changed.",
    icon: Users,
    style: "bg-indigo-100 text-indigo-600",
  },
  status_changed: {
    label: "Status Changed",
    description: "The ticket status was updated.",
    icon: RefreshCw,
    style: "bg-green-100 text-green-600",
  },
  priority_changed: {
    label: "Priority Changed",
    description: "The ticket priority was updated.",
    icon: Flag,
    style: "bg-orange-100 text-orange-600",
  },
};

const fallbackConfig = {
  label: "Ticket Activity",
  description: "An activity was recorded.",
  icon: History,
  style: "bg-slate-100 text-slate-600",
};

const getActivityConfig = (action: string) =>
  Object.prototype.hasOwnProperty.call(
    activityConfig,
    action
  )
    ? activityConfig[action as TicketActivityAction]
    : fallbackConfig;

const valueLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const formatValue = (
  value: string | null
): string => {
  if (value === null || value.trim() === "") {
    return "Not Set";
  }

  return Object.prototype.hasOwnProperty.call(
    valueLabels,
    value
  )
    ? valueLabels[value]
    : value;
};

const formatDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const getTimestamp = (value: string): number => {
  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
};

const TicketActivityTimeline = ({
  ticketId,
  refreshKey = 0,
}: TicketActivityTimelineProps) => {
  const [activities, setActivities] =
    useState<TicketActivity[]>([]);

  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filter, setFilter] =
    useState<TicketActivityFilter>("all");

  const [sort, setSort] =
    useState<TicketActivitySort>("newest");

  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadActivities = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getTicketActivities(
          ticketId,
          controller.signal
        );

        if (controller.signal.aborted) {
          return;
        }

        setActivities(data);
        setHasLoaded(true);
        setLastUpdated(new Date());
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setError(getApiErrorMessage(error));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadActivities();

    return () => {
      controller.abort();
    };
  }, [ticketId, refreshKey, retryKey]);

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activities
      .filter((activity) => {
        const matchesFilter =
          filter === "all" ||
          activity.action === filter;

        const config = getActivityConfig(
          activity.action
        );

        const searchableText = [
          activity.action,
          config.label,
          config.description,
          activity.old_value ?? "",
          activity.new_value ?? "",
          formatValue(activity.old_value),
          formatValue(activity.new_value),
          activity.performed_by,
          formatDate(activity.created_at),
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !query || searchableText.includes(query);

        return matchesFilter && matchesSearch;
      })
      .sort((first, second) => {
        const difference =
          getTimestamp(second.created_at) -
          getTimestamp(first.created_at);

        const comparison =
          difference || second.id - first.id;

        return sort === "newest"
          ? comparison
          : -comparison;
      });
  }, [activities, search, filter, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredActivities.length / PAGE_SIZE
    )
  );

  const currentPage = Math.min(page, totalPages);

  const startIndex =
    (currentPage - 1) * PAGE_SIZE;

  const endIndex = Math.min(
    startIndex + PAGE_SIZE,
    filteredActivities.length
  );

  const visibleActivities =
    filteredActivities.slice(
      startIndex,
      endIndex
    );

  const hasFilters =
    search.trim() !== "" || filter !== "all";

  const handleClearFilters = () => {
    setSearch("");
    setFilter("all");
    setSort("newest");
    setPage(1);
  };

  const handleRefresh = () => {
    if (!loading) {
      setRetryKey((previous) => previous + 1);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
            <History size={23} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-800">
              Ticket Activity History
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Track changes made throughout the ticket lifecycle.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />

          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="space-y-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              {activities.length} Activities
            </span>
          </div>

          {lastUpdated && (
            <p className="text-xs text-slate-400">
              Last updated:{" "}
              {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              aria-label="Search ticket activities"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search activities..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            aria-label="Filter activity type"
            value={filter}
            onChange={(event) => {
              setFilter(
                event.target.value as TicketActivityFilter
              );

              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="all">
              All Activities
            </option>

            <option value="created">
              Ticket Created
            </option>

            <option value="assigned">
              Agent Assigned
            </option>

            <option value="reassigned">
              Agent Reassigned
            </option>

            <option value="status_changed">
              Status Changed
            </option>

            <option value="priority_changed">
              Priority Changed
            </option>
          </select>

          <select
            aria-label="Sort activities"
            value={sort}
            onChange={(event) => {
              setSort(
                event.target.value as TicketActivitySort
              );

              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>
          </select>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <X size={15} />
            Clear Filters
          </button>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="shrink-0"
              />

              <div>
                <p>{error}</p>

                {hasLoaded && (
                  <p className="mt-1 text-xs">
                    Showing the last available activity records.
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleRefresh}
              className="mt-3 font-medium underline disabled:opacity-50"
            >
              Try Again
            </button>
          </div>
        )}

        {loading && !hasLoaded ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500">
            <LoaderCircle
              size={26}
              className="animate-spin text-blue-600"
            />

            Loading activity history...
          </div>
        ) : !hasLoaded && error ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Activity history is currently unavailable.
          </div>
        ) : visibleActivities.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <History
              size={42}
              className="mb-4 text-slate-300"
            />

            <h3 className="font-medium text-slate-700">
              {hasFilters
                ? "No matching activities"
                : "No activity history"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {hasFilters
                ? "Try changing your search or filters."
                : "No activity records have been returned for this ticket."}
            </p>
          </div>
        ) : (
          <ol className="space-y-0">
            {visibleActivities.map(
              (activity, index) => {
                const config = getActivityConfig(
                  activity.action
                );

                const ActivityIcon = config.icon;

                const isLast =
                  index === visibleActivities.length - 1;

                const hasValues =
                  activity.old_value !== null ||
                  activity.new_value !== null;

                return (
                  <li
                    key={activity.id}
                    className="relative flex gap-4 pb-6"
                  >
                    {!isLast && (
                      <div className="absolute bottom-0 left-5 top-10 w-px bg-slate-200" />
                    )}

                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.style}`}
                    >
                      <ActivityIcon size={19} />
                    </div>

                    <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-800">
                          {config.label}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock size={13} />

                          <time dateTime={activity.created_at}>
                            {formatDate(activity.created_at)}
                          </time>
                        </div>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        {config.description}
                      </p>

                      {hasValues && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="break-all rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                            {formatValue(
                              activity.old_value
                            )}
                          </span>

                          <ArrowRight
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="break-all rounded-md border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                            {formatValue(
                              activity.new_value
                            )}
                          </span>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
                        <p className="break-all text-xs text-slate-500">
                          Performed by:{" "}
                          <span className="font-medium text-slate-700">
                            {activity.performed_by ||
                              "Not recorded"}
                          </span>
                        </p>

                        <span className="text-xs text-slate-400">
                          Activity #{activity.id}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              }
            )}
          </ol>
        )}

        {hasLoaded && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              Showing{" "}
              {filteredActivities.length === 0
                ? 0
                : startIndex + 1}{" "}
              to {endIndex} of{" "}
              {filteredActivities.length} activities
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Previous activity page"
                disabled={currentPage <= 1}
                onClick={() =>
                  setPage(currentPage - 1)
                }
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="text-xs font-medium text-slate-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                aria-label="Next activity page"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage(currentPage + 1)
                }
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TicketActivityTimeline;