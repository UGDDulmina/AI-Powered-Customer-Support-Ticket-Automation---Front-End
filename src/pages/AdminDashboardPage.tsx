import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  Ticket,
  Clock,
  LoaderCircle,
  CheckCircle2,
  Archive,
  Users,
  UserCheck,
  UserX,
  ContactRound,
  RefreshCw,
  AlertCircle,
  Workflow,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import {
  getAdminDashboardData,
} from "../api/adminDashboard.api";

import type {
  AdminDashboardData,
} from "../types/adminDashboard.types";

import LoadingSpinner from
  "../components/common/LoadingSpinner";

import {
  getApiErrorMessage,
} from "../utils/apiError";

import AdminDashboardCharts from
  "../components/admin/dashboard/adminDashboardCharts";

const quickActions = [
  {
    title: "Manage Agents",
    description: "Register and manage support agents.",
    path: "/admin/agents",
    icon: Users,
  },
  {
    title: "Manage Customers",
    description: "View and manage customer records.",
    path: "/admin/customers",
    icon: ContactRound,
  },
  {
    title: "Manage Tickets",
    description: "Monitor customer support tickets.",
    path: "/admin/tickets",
    icon: Ticket,
  },
  {
    title: "AI Automation",
    description: "Monitor automated support workflows.",
    path: "/admin/automation",
    icon: Workflow,
  },
];


const AdminDashboardPage = () => {

  const { user } = useAuth();

  const [data, setData] =
    useState<AdminDashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

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

        const dashboardData =
          await getAdminDashboardData(
            controller.signal
          );

        if (controller.signal.aborted) {
          return;
        }

        setData(dashboardData);

        setLastUpdated(new Date());

      } catch (err: unknown) {

        if (controller.signal.aborted) {
          return;
        }

        setError(getApiErrorMessage(err));

      } finally {

        if (!controller.signal.aborted) {

          setLoading(false);

          setRefreshing(false);

        }

      }

    },
    []
  );


  useEffect(() => {

    void loadDashboard();

    return () => {
      controllerRef.current?.abort();
    };

  }, [loadDashboard]);


  const handleRefresh = () => {

    if (loading || refreshing) return;

    void loadDashboard(true);

  };


  if (loading && !data) {

    return (
      <LoadingSpinner
        message="Loading administrator dashboard..."
      />
    );

  }


  if (!data) {

    return (

      <div className="rounded-xl border
                      border-red-200 bg-white
                      p-8 text-center">

        <AlertCircle
          size={40}
          className="mx-auto mb-4 text-red-500"
        />

        <h2 className="text-lg font-semibold
                       text-slate-800">

          Unable to load dashboard

        </h2>

        <p className="mt-2 text-sm text-red-600">

          {error || "Dashboard data is unavailable."}

        </p>

        <button
          onClick={() => void loadDashboard()}
          className="mt-5 rounded-lg bg-blue-600
                     px-5 py-2 text-white
                     hover:bg-blue-700"
        >

          Try Again

        </button>

      </div>

    );

  }



  const ticketCards = [
    {
      title: "Total Tickets",
      value: data.tickets.overview.total_tickets,
      icon: Ticket,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Open Tickets",
      value: data.tickets.by_status.open,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "In Progress",
      value: data.tickets.by_status.in_progress,
      icon: LoaderCircle,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Resolved",
      value: data.tickets.by_status.resolved,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Closed",
      value: data.tickets.by_status.closed,
      icon: Archive,
      color: "bg-slate-100 text-slate-600",
    },
  ];



  const accountCards = [
    {
      title: "Total Agents",
      value: data.agents.total,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Active Agents",
      value: data.agents.active,
      icon: UserCheck,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Inactive Agents",
      value: data.agents.inactive,
      icon: UserX,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Total Customers",
      value: data.totalCustomers,
      icon: ContactRound,
      color: "bg-cyan-50 text-cyan-600",
    },
  ];


  return (

    <div className="space-y-8">

      <div className="flex flex-wrap
                      items-center justify-between
                      gap-4">

        <div>

          <h1 className="text-2xl font-bold
                         text-slate-900">

            Admin Dashboard

          </h1>

          <p className="mt-1 text-slate-500">

            Welcome back, {user?.name}.

          </p>

          {lastUpdated && (

            <p className="mt-2 text-xs
                          text-slate-400">

              Last updated:{" "}

              {lastUpdated.toLocaleString()}

            </p>

          )}

        </div>


        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-2
                     rounded-lg border
                     border-slate-200 bg-white
                     px-4 py-2 text-sm
                     font-medium text-slate-700
                     hover:bg-slate-50
                     disabled:opacity-50"
        >

          <RefreshCw
            size={17}
            className={
              refreshing ? "animate-spin" : ""
            }
          />

          {refreshing ? "Refreshing..." : "Refresh"}

        </button>

      </div>

      {error && (

        <div
          role="alert"
          className="flex items-center gap-3
                     rounded-lg border
                     border-red-200 bg-red-50
                     p-4 text-sm text-red-700"
        >

          <AlertCircle size={20} />

          <span>

            Refresh failed: {error}.
            Showing previously loaded data.

          </span>

        </div>

      )}

      <div className="rounded-2xl bg-blue-600
                      p-6 text-white">

        <h2 className="text-xl font-semibold">

          AI Customer Support System

        </h2>

        <p className="mt-2 text-blue-100">

          Monitor customer support performance,
          manage agents and track AI automation.

        </p>

      </div>

      <section>

        <h2 className="mb-4 text-lg font-semibold
                       text-slate-800">

          Ticket Overview

        </h2>

        <div className="grid grid-cols-1 gap-4
                        sm:grid-cols-2
                        xl:grid-cols-5">

          {ticketCards.map((card) => {

            const Icon = card.icon;

            return (

              <div
                key={card.title}
                className="rounded-xl border
                           border-slate-200
                           bg-white p-5 shadow-sm"
              >

                <div className={`mb-4 inline-flex
                                 rounded-lg p-3
                                 ${card.color}`}>

                  <Icon size={22} />

                </div>

                <p className="text-sm
                              text-slate-500">

                  {card.title}

                </p>

                <h3 className="mt-2 text-3xl
                               font-bold
                               text-slate-900">

                  {card.value.toLocaleString()}

                </h3>

              </div>

            );

          })}

        </div>

      </section>

      <section>

        <h2 className="mb-4 text-lg font-semibold
                       text-slate-800">

          Agents and Customers

        </h2>

        <div className="grid grid-cols-1 gap-4
                        sm:grid-cols-2
                        xl:grid-cols-4">

          {accountCards.map((card) => {

            const Icon = card.icon;

            return (

              <div
                key={card.title}
                className="rounded-xl border
                           border-slate-200
                           bg-white p-5 shadow-sm"
              >

                <div className={`mb-4 inline-flex
                                 rounded-lg p-3
                                 ${card.color}`}>

                  <Icon size={22} />

                </div>

                <p className="text-sm
                              text-slate-500">

                  {card.title}

                </p>

                <h3 className="mt-2 text-3xl
                               font-bold
                               text-slate-900">

                  {card.value.toLocaleString()}

                </h3>

              </div>

            );

          })}

        </div>

      </section>

      <AdminDashboardCharts data={data} />

      <section>

        <h2 className="mb-4 text-lg font-semibold
                       text-slate-800">

          Quick Actions

        </h2>

        <div className="grid grid-cols-1 gap-4
                        md:grid-cols-2
                        xl:grid-cols-4">

          {quickActions.map((action) => {

            const Icon = action.icon;

            return (

              <Link
                key={action.path}
                to={action.path}
                className="rounded-xl border
                           border-slate-200
                           bg-white p-5 shadow-sm
                           transition
                           hover:border-blue-300
                           hover:shadow-md"
              >

                <div className="mb-4 inline-flex
                                rounded-lg
                                bg-blue-50 p-3
                                text-blue-600">

                  <Icon size={24} />

                </div>

                <h3 className="font-semibold
                               text-slate-800">

                  {action.title}

                </h3>

                <p className="mt-2 text-sm
                              text-slate-500">

                  {action.description}

                </p>

              </Link>

            );

          })}

        </div>

      </section>

    </div>

  );

};


export default AdminDashboardPage;