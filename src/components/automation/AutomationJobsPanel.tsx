
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import {
  getTicketAutomationJobs,
  retryAutomationJob,
  type AutomationJob,
} from "../../api/automation.api";

interface AutomationJobsPanelProps {
  ticketId: number;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    const status = error.response?.status;

    if (status === 401) {
      return "Your session has expired. Please log in again.";
    }

    if (status === 403) {
      return "You do not have permission to perform this action.";
    }

    if (status === 404) {
      return "Automation endpoint or job was not found.";
    }

    return `Request failed${status ? ` (${status})` : ""}.`;
  }

  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

function getStatusClasses(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
    case "success":
      return "bg-green-100 text-green-700";

    case "failed":
      return "bg-red-100 text-red-700";

    case "processing":
    case "running":
      return "bg-blue-100 text-blue-700";

    case "pending":
    case "queued":
      return "bg-yellow-100 text-yellow-800";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString();
}

export default function AutomationJobsPanel({
  ticketId,
}: AutomationJobsPanelProps) {
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retryingJobId, setRetryingJobId] = useState<number | null>(
    null
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadJobs = useCallback(async () => {
    const data = await getTicketAutomationJobs(ticketId);
    setJobs(data);
  }, [ticketId]);

  useEffect(() => {
    let active = true;

    async function fetchJobs() {
      setLoading(true);
      setError("");
      setSuccess("");
      setJobs([]);

      try {
        const data = await getTicketAutomationJobs(ticketId);

        if (active) {
          setJobs(data);
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchJobs();

    return () => {
      active = false;
    };
  }, [ticketId]);

  async function handleRefresh() {
    setRefreshing(true);
    setError("");
    setSuccess("");

    try {
      await loadJobs();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }

  async function handleRetry(jobId: number) {
    setRetryingJobId(jobId);
    setError("");
    setSuccess("");

    try {
      await retryAutomationJob(jobId);

      setSuccess(`Job #${jobId} submitted for retry.`);

      await loadJobs();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRetryingJobId(null);
    }
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            AI Automation Jobs
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Monitor and retry automation jobs for Ticket #{ticketId}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loading || refreshing || retryingJobId !== null}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing ? "Refreshing..." : "Refresh Jobs"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Loading automation jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <p className="font-medium text-slate-700">
            No automation jobs found
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Jobs associated with this ticket will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Job #{job.id}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Attempts: {job.attempt_count}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClasses(
                    job.status
                  )}`}
                >
                  {job.status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-slate-500">Created</p>
                  <p className="font-medium text-slate-700">
                    {formatDate(job.crated_at)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Started</p>
                  <p className="font-medium text-slate-700">
                    {formatDate(job.started_at)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Completed</p>
                  <p className="font-medium text-slate-700">
                    {formatDate(job.completed_at)}
                  </p>
                </div>
              </div>

              {job.error_message && (
                <div className="mt-4 rounded-lg bg-red-50 p-3">
                  <p className="text-xs font-semibold text-red-700">
                    Error Details
                  </p>

                  <p className="mt-1 break-words text-sm text-red-700">
                    {job.error_message}
                  </p>
                </div>
              )}

              {job.status.toLowerCase() === "failed" && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void handleRetry(job.id)}
                    disabled={retryingJobId !== null || refreshing}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {retryingJobId === job.id
                      ? "Retrying..."
                      : "Retry Job"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
