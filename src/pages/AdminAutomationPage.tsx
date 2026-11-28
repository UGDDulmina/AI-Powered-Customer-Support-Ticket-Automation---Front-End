import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  Workflow,
  RefreshCw,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  AlertCircle,
  Eye,
  X,
  RotateCcw,
  Activity,
  ChartNoAxesCombined,
} from "lucide-react";

import {
  getAdminAutomationJobs,
  getAdminAutomationJobById,
  retryAdminAutomationJob,
  getAutomationJobStatistics,
} from "../api/adminAutomation.api";

import type {
  AdminAutomationJob,
  AdminAutomationListResponse,
  AutomationStatusFilter,
  AutomationJobStatistics,
} from "../types/adminAutomation.types";

import {
  MAX_AUTOMATION_ATTEMPTS,
} from "../types/adminAutomation.types";

import { getApiErrorMessage } from "../utils/apiError";

const PAGE_SIZE = 10;
const REFRESH_INTERVAL = 5000;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const formatDate = (value: string | null): string => {
  if (!value) return "N/A";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleString();
};

const canRetry = (job: AdminAutomationJob): boolean => {
  return (
    job.status === "failed" &&
    job.attempt_count < MAX_AUTOMATION_ATTEMPTS
  );
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        STATUS_STYLES[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status === "processing" && (
        <LoaderCircle size={12} className="animate-spin" />
      )}

      {status}
    </span>
  );
}

interface JobDetailsProps {
  job: AdminAutomationJob;
  onClose: () => void;
}

function JobDetailsModal({
  job,
  onClose,
}: JobDetailsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog?.showModal();

    return () => {
      dialog?.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-xl bg-white p-0 shadow-xl backdrop:bg-black/50"
    >
      <div className="flex items-center justify-between border-b border-gray-200 p-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Automation Job #{job.id}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Execution details and status
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close job details"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Job ID</p>
            <p className="mt-1 font-semibold">#{job.id}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Ticket ID</p>

            <Link
              to={`/admin/tickets/${job.ticket_id}`}
              className="mt-1 inline-block font-semibold text-blue-600 hover:underline"
            >
              #{job.ticket_id}
            </Link>
          </div>

          <div>
            <p className="mb-1 text-xs text-gray-500">
              Status
            </p>

            <StatusBadge status={job.status} />
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Execution Attempts
            </p>

            <p className="mt-1 font-semibold">
              {job.attempt_count} / {MAX_AUTOMATION_ATTEMPTS}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Created At
            </p>

            <p className="mt-1 text-sm">
              {formatDate(job.crated_at)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Started At
            </p>

            <p className="mt-1 text-sm">
              {job.status === "pending"
                ? "N/A"
                : formatDate(job.started_at)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Completed At
            </p>

            <p className="mt-1 text-sm">
              {job.status === "completed" ||
              job.status === "failed"
                ? formatDate(job.completed_at)
                : "N/A"}
            </p>
          </div>
        </div>

        {job.error_message && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle size={18} />

              <h3 className="text-sm font-semibold">
                Failure Details
              </h3>
            </div>

            <p className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-all text-sm text-red-600">
              {job.error_message}
            </p>
          </div>
        )}

        {job.status === "failed" &&
          job.attempt_count >= MAX_AUTOMATION_ATTEMPTS && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              Maximum execution attempts reached.
              This job cannot be retried.
            </div>
          )}
      </div>

      <div className="flex justify-end border-t border-gray-200 p-5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </dialog>
  );
}

export default function AdminAutomationPage() {
  const [data, setData] =
    useState<AdminAutomationListResponse | null>(null);

  const [statistics, setStatistics] =
    useState<AutomationJobStatistics | null>(null);

  const [search, setSearch] = useState("");
  const [searchId, setSearchId] = useState<number>();
  const [status, setStatus] =
    useState<AutomationStatusFilter>("all");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchError, setSearchError] = useState("");

  const [selectedJob, setSelectedJob] =
    useState<AdminAutomationJob | null>(null);

  const [retryJob, setRetryJob] =
    useState<AdminAutomationJob | null>(null);

  const [retryingId, setRetryingId] =
    useState<number | null>(null);

  const [detailsLoadingId, setDetailsLoadingId] =
    useState<number | null>(null);

  const [lastUpdated, setLastUpdated] = useState("");

  const retryLock = useRef(false);
  const detailController = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      detailController.current?.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    let timer: ReturnType<typeof setTimeout> | undefined;

    const loadJobs = async (background = false) => {
      if (!background) {
        setLoading(true);
      }

      setError("");

      try {
        const [jobs, stats] = await Promise.all([
          getAdminAutomationJobs(
            {
              page,
              limit: PAGE_SIZE,
              status: status === "all" ? undefined : status,
              search: searchId,
            },
            controller.signal
          ),
          getAutomationJobStatistics(controller.signal),
        ]);

        if (controller.signal.aborted) return;

        const maximumPage = Math.max(1, jobs.total_pages);

        if (page > maximumPage) {
          setPage(maximumPage);
          return;
        }

        setData(jobs);
        setStatistics(stats);
        setLastUpdated(new Date().toLocaleString());
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(getApiErrorMessage(requestError));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);

          if (autoRefresh) {
            timer = setTimeout(
              () => void loadJobs(true),
              REFRESH_INTERVAL
            );
          }
        }
      }
    };

    void loadJobs();

    return () => {
      controller.abort();

      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, [page, status, searchId, refreshKey, autoRefresh]);

  const refreshJobs = () => {
    setRefreshKey((previous) => previous + 1);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      setSearchError("");
      setSearchId(undefined);
      setPage(1);
      return;
    }

    const numericValue = Number(value);

    if (
      !/^\d+$/.test(value) ||
      !Number.isSafeInteger(numericValue) ||
      numericValue <= 0 ||
      numericValue > 2147483647
    ) {
      setSearchError("Enter a valid positive job or ticket ID.");
      return;
    }

    setSearchError("");
    setSearchId(numericValue);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchId(undefined);
    setSearchError("");
    setStatus("all");
    setPage(1);
  };

  const handleViewJob = async (jobId: number) => {
    detailController.current?.abort();

    const controller = new AbortController();

    detailController.current = controller;

    setDetailsLoadingId(jobId);
    setError("");

    try {
      const job = await getAdminAutomationJobById(
        jobId,
        controller.signal
      );

      if (!controller.signal.aborted) {
        setSelectedJob(job);
      }
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setError(getApiErrorMessage(requestError));
      }
    } finally {
      if (!controller.signal.aborted) {
        setDetailsLoadingId(null);
      }
    }
  };

  const handleRetry = async () => {
    if (
      !retryJob ||
      !canRetry(retryJob) ||
      retryLock.current
    ) {
      return;
    }

    const jobId = retryJob.id;

    retryLock.current = true;
    setRetryingId(jobId);
    setError("");
    setSuccess("");

    try {
      await retryAdminAutomationJob(jobId);

      setSuccess(
        `Automation job #${jobId} has been submitted for retry.`
      );

      setRetryJob(null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      setRetryJob(null);
    } finally {
      retryLock.current = false;
      setRetryingId(null);
      refreshJobs();
    }
  };

  const cards = [
    {
      title: "Total Jobs",
      value: statistics?.total,
      icon: Workflow,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending",
      value: statistics?.pending,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Processing",
      value: statistics?.processing,
      icon: Activity,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Completed",
      value: statistics?.completed,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Failed",
      value: statistics?.failed,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Success Rate",
      value: statistics
        ? statistics.total > 0
          ? `${statistics.successRate.toFixed(1)}%`
          : "N/A"
        : undefined,
      icon: ChartNoAxesCombined,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const jobs = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
            <Workflow size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Automation Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Monitor and manage AI automation jobs
            </p>

            {lastUpdated && (
              <p className="mt-2 text-xs text-gray-400">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(event) =>
                setAutoRefresh(event.target.checked)
              }
              className="accent-blue-600"
            />

            Auto Refresh
          </label>

          <button
            type="button"
            onClick={refreshJobs}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="shrink-0" />

          <div className="flex-1">
            <p>{error}</p>

            {data && (
              <p className="mt-1 text-xs">
                Previously loaded records may be displayed.
              </p>
            )}
          </div>

          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          <CheckCircle2 size={19} />

          <p className="flex-1">{success}</p>

          <button
            type="button"
            aria-label="Dismiss success message"
            onClick={() => setSuccess("")}
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-gray-500">
                  {card.title}
                </p>

                <div className={`rounded-lg p-2 ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>

              <p className="mt-3 text-2xl font-bold text-gray-900">
                {card.value ?? "N/A"}
              </p>
            </div>
          );
        })}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Automation Jobs
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            View execution status, failure details and retry attempts
          </p>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row">
            <form
              onSubmit={handleSearch}
              className="flex flex-1 gap-2"
            >
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <input
                  type="text"
                  inputMode="numeric"
                  value={search}
                  aria-label="Search by job or ticket ID"
                  placeholder="Job ID or Ticket ID"
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setSearchError("");
                  }}
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Search
              </button>
            </form>

            <select
              value={status}
              aria-label="Filter automation status"
              onChange={(event) => {
                setStatus(
                  event.target.value as AutomationStatusFilter
                );
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>

          {searchError && (
            <p className="mt-2 text-xs text-red-600">
              {searchError}
            </p>
          )}

          {searchId !== undefined && (
            <p className="mt-2 text-xs text-gray-500">
              Showing jobs matching ID: {searchId}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <LoaderCircle
              size={32}
              className="animate-spin text-blue-600"
            />

            <p className="mt-3 text-sm text-gray-500">
              Loading automation jobs...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  {[
                    "Job ID",
                    "Ticket",
                    "Status",
                    "Attempts",
                    "Created At",
                    "Failure Details",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-5 py-4 font-semibold"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      #{job.id}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to={`/admin/tickets/${job.ticket_id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        #{job.ticket_id}
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={job.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {Array.from({
                            length: MAX_AUTOMATION_ATTEMPTS,
                          }).map((_, index) => (
                            <span
                              key={index}
                              className={`h-2 w-5 rounded-full ${
                                index < job.attempt_count
                                  ? job.status === "failed"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>

                        <span className="text-xs text-gray-500">
                          {job.attempt_count}/{MAX_AUTOMATION_ATTEMPTS}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs text-gray-500">
                      {formatDate(job.crated_at)}
                    </td>

                    <td className="px-5 py-4">
                      {job.error_message ? (
                        <p className="max-w-48 truncate text-xs text-red-600">
                          {job.error_message}
                        </p>
                      ) : (
                        <span className="text-xs text-gray-400">
                          N/A
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={detailsLoadingId !== null}
                          onClick={() => handleViewJob(job.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          {detailsLoadingId === job.id ? (
                            <LoaderCircle
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Eye size={14} />
                          )}

                          View
                        </button>

                        {canRetry(job) && (
                          <button
                            type="button"
                            disabled={retryingId !== null}
                            onClick={() => setRetryJob(job)}
                            className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                          >
                            <RotateCcw size={14} />
                            Retry
                          </button>
                        )}

                        {job.status === "failed" &&
                          !canRetry(job) && (
                            <span className="text-xs text-gray-400">
                              Limit reached
                            </span>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}

                {jobs.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-gray-500"
                    >
                      {error
                        ? "Unable to retrieve automation jobs."
                        : "No matching automation jobs found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {data && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 p-5">
            <p className="text-sm text-gray-500">
              {data.total === 0
                ? "0 jobs"
                : `Showing ${(data.page - 1) * PAGE_SIZE + 1} to ${Math.min(
                    data.page * PAGE_SIZE,
                    data.total
                  )} of ${data.total} jobs`}
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={loading || !data.has_previous}
                onClick={() =>
                  setPage((previous) => Math.max(1, previous - 1))
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                {data.page} / {Math.max(1, data.total_pages)}
              </span>

              <button
                type="button"
                disabled={loading || !data.has_next}
                onClick={() =>
                  setPage((previous) => previous + 1)
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

      {retryJob && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="retry-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 inline-flex rounded-full bg-amber-100 p-3 text-amber-600">
              <RotateCcw size={24} />
            </div>

            <h2
              id="retry-dialog-title"
              className="text-lg font-bold text-gray-900"
            >
              Retry Automation Job
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Retry automation job #{retryJob.id} for ticket
              #{retryJob.ticket_id}?
            </p>

            <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Current attempts
                </span>

                <span className="font-semibold">
                  {retryJob.attempt_count}
                </span>
              </div>

              <div className="mt-2 flex justify-between">
                <span className="text-gray-500">
                  Remaining attempts
                </span>

                <span className="font-semibold">
                  {Math.max(
                    0,
                    MAX_AUTOMATION_ATTEMPTS - retryJob.attempt_count
                  )}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              The job will be submitted for background processing again.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={retryingId !== null}
                onClick={() => setRetryJob(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={retryingId !== null}
                onClick={handleRetry}
                className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {retryingId !== null && (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                )}

                {retryingId !== null
                  ? "Submitting..."
                  : "Confirm Retry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}