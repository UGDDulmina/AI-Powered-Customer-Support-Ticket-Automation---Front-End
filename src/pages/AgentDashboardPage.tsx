import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  LoaderCircle,
  Ticket,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import {
  getAgentDashboardData,
} from "../api/agentDashboard.api";

import type {
  AgentDashboardData,
} from "../types/agentDashboard.types";

import AgentDashboardStats from
  "../components/agent/dashboard/AgentDashboardStats";

import AgentDashboardCharts from
  "../components/agent/dashboard/AgentDashboardCharts";

import AgentCompletionCard from
  "../components/agent/dashboard/AgentCompletionCard";

import AgentRecentTickets from
  "../components/agent/dashboard/AgentRecentTickets";

import {
  getApiErrorMessage,
} from "../utils/apiError";

interface AgentDashboardContentProps {
  agentId: number;
  agentName: string;
}

const AgentDashboardContent = ({
  agentId,
  agentName,
}: AgentDashboardContentProps) => {
  const [data, setData] =
    useState<AgentDashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const controllerRef =
    useRef<AbortController | null>(null);

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      controllerRef.current?.abort();

      const controller = new AbortController();
      controllerRef.current = controller;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await getAgentDashboardData(
          agentId,
          controller.signal
        );

        if (controller.signal.aborted) {
          return;
        }

        setData(response);
        setLastUpdated(new Date());
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setError(getApiErrorMessage(error));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [agentId]
  );

  useEffect(() => {
    void loadDashboard();

    return () => {
      controllerRef.current?.abort();
    };
  }, [loadDashboard]);

  const handleRefresh = () => {
    if (!loading && !refreshing) {
      void loadDashboard(true);
    }
  };

  const firstName =
    agentName.trim().split(/\s+/)[0] ||
    "Support Agent";

  const busy = loading || refreshing;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back, {firstName}!
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Here is an overview of your assigned support tickets.
          </p>

          {lastUpdated && (
            <p className="mt-2 text-xs text-slate-400">
              Last updated:{" "}
              {lastUpdated.toLocaleString("en-GB")}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={busy ? "animate-spin" : ""}
          />

          {busy ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <AlertCircle
            size={22}
            className="shrink-0 text-red-600"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-red-700">
              Unable to load dashboard
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            {data && (
              <p className="mt-1 text-xs text-red-500">
                Showing the last successfully retrieved data.
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={handleRefresh}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Try Again
          </button>
        </div>
      )}

      {busy && !data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="h-4 w-32 rounded bg-slate-200" />

                  <div className="mt-5 h-8 w-16 rounded bg-slate-200" />

                  <div className="mt-5 h-3 w-40 rounded bg-slate-100" />
                </div>
              )
            )}
          </div>

          <div className="flex min-h-48 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-500">
            <LoaderCircle
              size={24}
              className="animate-spin text-blue-600"
            />

            Loading your dashboard...
          </div>
        </div>
      )}

      {data && (
        <>
          {data.statistics.activeUrgent > 0 && (
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-5">
              <div className="rounded-xl bg-red-100 p-3 text-red-600">
                <AlertTriangle size={25} />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-red-800">
                  Urgent tickets require your attention
                </h3>

                <p className="mt-1 text-sm text-red-700">
                  You have {data.statistics.activeUrgent} active
                  urgent ticket(s).
                </p>
              </div>

              <a
                href="#urgent-tickets"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Review Urgent Tickets
                <ArrowRight size={16} />
              </a>
            </div>
          )}

          <AgentDashboardStats
            statistics={data.statistics}
          />

          <AgentDashboardCharts data={data} />

          <AgentCompletionCard
            statistics={data.statistics}
          />

          {data.statistics.activeUrgent > 0 && (
            <div
              id="urgent-tickets"
              className="scroll-mt-24"
            >
              <AgentRecentTickets
                tickets={data.urgentTickets}
                urgentOnly
              />
            </div>
          )}

          <AgentRecentTickets
            tickets={data.recentTickets}
          />

          <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-blue-600 p-6 text-white shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white/15 p-3">
                <Ticket size={26} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Manage Your Support Tickets
                </h3>

                <p className="mt-1 text-sm text-blue-100">
                  View assigned tickets and respond to customer requests.
                </p>
              </div>
            </div>

            <Link
              to="/agent/tickets"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              Open My Tickets
              <ArrowRight size={17} />
            </Link>
          </section>
        </>
      )}
    </div>
  );
};

const AgentDashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
        <LoaderCircle
          size={25}
          className="animate-spin text-blue-600"
        />

        Loading account information...
      </div>
    );
  }

  if (!user || user.role !== "agent") {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
      >
        You do not have permission to access the agent dashboard.
      </div>
    );
  }

  return (
    <AgentDashboardContent
      key={user.id}
      agentId={user.id}
      agentName={user.name}
    />
  );
};

export default AgentDashboardPage;