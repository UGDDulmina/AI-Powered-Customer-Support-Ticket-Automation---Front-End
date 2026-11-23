
import { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  getDashboardStats,
  type DashboardStats,
} from "../api/dashboard.api";

const initialStats: DashboardStats = {
  total: 0,
  open: 0,
  inProgress: 0,
  resolved: 0,
  closed: 0,
  pending: 0,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(
    initialStats
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    const data = await getDashboardStats();
    setStats(data);
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchStats() {
      try {
        const data = await getDashboardStats();

        if (active) {
          setStats(data);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load dashboard statistics."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchStats();

    return () => {
      active = false;
    };
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setError("");

    try {
      await loadStats();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh dashboard."
      );
    } finally {
      setRefreshing(false);
    }
  }

  const cards = [
    { title: "Total Tickets", value: stats.total },
    { title: "Open Tickets", value: stats.open },
    { title: "In Progress", value: stats.inProgress },
    { title: "Resolved", value: stats.resolved },
    { title: "Closed", value: stats.closed },
    { title: "Pending", value: stats.pending },
  ];

  const chartData = [
    { status: "Open", count: stats.open },
    { status: "In Progress", count: stats.inProgress },
    { status: "Resolved", count: stats.resolved },
    { status: "Closed", count: stats.closed },
    { status: "Pending", count: stats.pending },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Support Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Customer support ticket statistics
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={loading || refreshing}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-600">
            Loading dashboard...
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <p className="text-sm text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold">
                Tickets by Status
              </h2>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
