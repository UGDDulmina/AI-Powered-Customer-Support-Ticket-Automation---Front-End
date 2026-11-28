import { useEffect, useState } from "react";

import {
  BrainCircuit,
  RefreshCw,
  AlertCircle,
  LoaderCircle,
  CalendarDays,
} from "lucide-react";

import {
  getAIAnalyticsDashboardData,
} from "../api/aiAnalytics.api";

import type {
  AIAnalyticsDashboardData,
  AIAnalyticsPeriod,
} from "../types/aiAnalytics.types";

import { getApiErrorMessage } from "../utils/apiError";

import AIAnalyticsStats from "../components/admin/analytics/AIAnalyticsStats";
import AIAnalyticsCharts from "../components/admin/analytics/AIAnalyticsCharts";
import AIAutomationTrends from "../components/admin/analytics/AIAutomationTrends";
import AgentAIAnalyticsTable from "../components/admin/analytics/AgentAIAnalyticsTable";
import AIReplyQualityStats from "../components/admin/analytics/AIReplyQualityStats";
import AIReplyLifecycleChart from "../components/admin/analytics/AIReplyLifecycleChart";
import AIReplyReviewInsights from "../components/admin/analytics/AIReplyReviewInsights";

const PERIODS: AIAnalyticsPeriod[] = [7, 14, 30];

type AnalyticsTab = "overview" | "replies" | "agents";

const TABS: {
  value: AnalyticsTab;
  label: string;
}[] = [
  {
    value: "overview",
    label: "Performance Overview",
  },
  {
    value: "replies",
    label: "AI Reply Analytics",
  },
  {
    value: "agents",
    label: "Agent Performance",
  },
];

export default function AdminAIAnalyticsPage() {
  const [data, setData] = useState<AIAnalyticsDashboardData | null>(null);
  const [period, setPeriod] = useState<AIAnalyticsPeriod>(7);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadAnalytics = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getAIAnalyticsDashboardData(
          period,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(getApiErrorMessage(requestError));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadAnalytics();

    return () => {
      controller.abort();
    };
  }, [period, refreshKey]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey((previous) => previous + 1);
  };

  const handlePeriodChange = (value: AIAnalyticsPeriod) => {
    if (value !== period) {
      setLoading(true);
      setPeriod(value);
    }
  };

  const lastUpdated = data
    ? new Date(data.fetchedAt).toLocaleString()
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
            <BrainCircuit size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              AI Performance Analytics
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Monitor AI suggestions, automation and agent performance
            </p>

            {lastUpdated && (
              <p className="mt-2 text-xs text-gray-400">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />

          {loading ? "Loading..." : "Refresh Analytics"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="shrink-0 text-red-600"
            />

            <div>
              <p className="font-medium text-red-700">
                Unable to load analytics
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

              {data && (
                <p className="mt-1 text-xs text-red-500">
                  Previously loaded data is displayed below.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            Try Again
          </button>
        </div>
      )}

      {loading && !data && (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white">
          <LoaderCircle
            size={36}
            className="animate-spin text-blue-600"
          />

          <p className="mt-4 text-sm font-medium text-gray-600">
            Loading AI analytics...
          </p>
        </div>
      )}

      {data && (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
            <div className="flex min-w-max gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={activeTab === tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-lg px-5 py-3 text-sm font-medium transition ${
                    activeTab === tab.value
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  Performance Overview
                </h2>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  All-time statistics
                </span>
              </div>

              <AIAnalyticsStats data={data} />

              <AIAnalyticsCharts data={data} />

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <CalendarDays
                    size={20}
                    className="text-blue-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Automation Trend Period
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      This filter applies only to the trend chart
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PERIODS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      disabled={loading}
                      aria-pressed={period === value}
                      onClick={() => handlePeriodChange(value)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
                        period === value
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {value} Days
                    </button>
                  ))}
                </div>
              </div>

              {loading && data.period !== period ? (
                <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white">
                  <LoaderCircle
                    size={30}
                    className="animate-spin text-blue-600"
                  />

                  <p className="mt-3 text-sm text-gray-500">
                    Updating automation trends...
                  </p>
                </div>
              ) : (
                <AIAutomationTrends
                  trends={data.trends}
                  period={data.period}
                />
              )}
            </div>
          )}

          {activeTab === "replies" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  All-time statistics
                </span>
              </div>

              <AIReplyQualityStats replies={data.replies} />

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <AIReplyLifecycleChart replies={data.replies} />

                <AIReplyReviewInsights replies={data.replies} />
              </div>
            </div>
          )}

          {activeTab === "agents" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  All-time statistics
                </span>
              </div>

              <AgentAIAnalyticsTable agents={data.agents} />
            </div>
          )}
        </>
      )}
    </div>
  );
}