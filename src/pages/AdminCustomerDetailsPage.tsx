import {
  useState,
  useEffect,
} from "react";

import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getCustomerById,
  getCustomerTickets,
  getCustomerTicketStatistics,
} from "../api/customers.api";

import type {
  Customer,
  CustomerTicketListResponse,
  CustomerTicketStatistics,
  CustomerTicketStatusFilter,
  CustomerTicketFilters,
} from "../types/customer.types";

import CustomerProfileCard from
  "../components/admin/customers/CustomerProfileCard";

import CustomerTicketStats from
  "../components/admin/customers/CustomerTicketsStatus";

import CustomerTicketHistory from
  "../components/admin/customers/CustomerTicketHistory";

import LoadingSpinner from
  "../components/common/LoadingSpinner";

import {
  getApiErrorMessage,
} from "../utils/apiError";

const PAGE_SIZE = 10;

interface CustomerDetailsContentProps {
  customerId: number;
}

const CustomerDetailsContent = ({
  customerId,
}: CustomerDetailsContentProps) => {
  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [stats, setStats] =
    useState<CustomerTicketStatistics | null>(null);

  const [tickets, setTickets] =
    useState<CustomerTicketListResponse | null>(null);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [statsLoading, setStatsLoading] =
    useState(true);

  const [ticketsLoading, setTicketsLoading] =
    useState(true);

  const [profileError, setProfileError] =
    useState("");

  const [statsError, setStatsError] =
    useState("");

  const [ticketsError, setTicketsError] =
    useState("");

  const [status, setStatus] =
    useState<CustomerTicketStatusFilter>("all");

  const [page, setPage] = useState(1);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [ticketRetryKey, setTicketRetryKey] =
    useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadCustomer = async () => {
      setProfileLoading(true);

      setProfileError("");

      try {
        const data = await getCustomerById(
          customerId,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setCustomer(data);
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setProfileError(getApiErrorMessage(error));
        }
      } finally {
        if (!controller.signal.aborted) {
          setProfileLoading(false);
        }
      }
    };

    const loadStatistics = async () => {
      setStatsLoading(true);

      setStatsError("");

      try {
        const data = await getCustomerTicketStatistics(
          customerId,
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

    void loadCustomer();

    void loadStatistics();

    return () => {
      controller.abort();
    };
  }, [customerId, refreshKey]);

  useEffect(() => {
    const controller = new AbortController();

    const loadTickets = async () => {
      setTicketsLoading(true);

      setTicketsError("");

      setTickets(null);

      const filters: CustomerTicketFilters = {
        page,
        limit: PAGE_SIZE,
      };

      if (status !== "all") {
        filters.status = status;
      }

      try {
        const data = await getCustomerTickets(
          customerId,
          filters,
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

    void loadTickets();

    return () => {
      controller.abort();
    };
  }, [
    customerId,
    status,
    page,
    refreshKey,
    ticketRetryKey,
  ]);

  const handleStatusChange = (
    value: CustomerTicketStatusFilter
  ) => {
    setStatus(value);

    setPage(1);
  };

  const handleRefresh = () => {
    setRefreshKey((previous) => previous + 1);
  };

  const handleRetryTickets = () => {
    setTicketRetryKey((previous) => previous + 1);
  };

  const refreshing =
    profileLoading ||
    statsLoading ||
    ticketsLoading;

  if (profileLoading && !customer) {
    return (
      <LoadingSpinner message="Loading customer details..." />
    );
  }

  if (!customer) {
    return (
      <div className="space-y-5">

        <Link
          to="/admin/customers"
          className="inline-flex items-center gap-2
                     text-sm font-medium text-slate-600
                     hover:text-blue-600"
        >

          <ArrowLeft size={18} />

          Back to Customers

        </Link>

        <div className="rounded-xl border border-red-200
                        bg-white p-8 text-center">

          <AlertCircle
            size={42}
            className="mx-auto mb-4 text-red-500"
          />

          <h2 className="text-lg font-semibold text-slate-800">
            Unable to load customer
          </h2>

          <p className="mt-2 text-sm text-red-600">

            {profileError || "Customer information is unavailable."}

          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="mt-5 rounded-lg bg-blue-600
                       px-5 py-2.5 text-sm font-medium
                       text-white hover:bg-blue-700"
          >

            Try Again

          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6">

      <Link
        to="/admin/customers"
        className="inline-flex items-center gap-2
                   text-sm font-medium text-slate-600
                   hover:text-blue-600"
      >

        <ArrowLeft size={18} />

        Back to Customers

      </Link>

      <div className="flex flex-wrap items-center
                      justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-slate-900">
            Customer Details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View customer information and support history.
          </p>

        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg
                     border border-slate-200 bg-white
                     px-4 py-2.5 text-sm font-medium
                     text-slate-700 hover:bg-slate-50
                     disabled:opacity-50"
        >

          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}

        </button>

      </div>

      {profileError && (

        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg
                     border border-red-200 bg-red-50
                     p-4 text-sm text-red-700"
        >

          <AlertCircle size={20} className="shrink-0" />

          <span>
            Customer refresh failed: {profileError}.
            Showing the last available profile.
          </span>

        </div>

      )}

      <CustomerProfileCard customer={customer} />

      <div className="space-y-4">

        <div>

          <h2 className="text-lg font-semibold text-slate-800">
            Support Statistics
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Overview of this customer's support activity.
          </p>

        </div>

        {statsError && (

          <div
            role="alert"
            className="flex flex-wrap items-center gap-3
                       rounded-lg border border-red-200
                       bg-red-50 p-4 text-sm text-red-700"
          >

            <AlertCircle size={20} />

            <span className="flex-1">

              Unable to load ticket statistics: {statsError}

              {stats && ". Showing the last available statistics."}

            </span>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="font-medium underline"
            >

              Retry

            </button>

          </div>

        )}

        {statsLoading && !stats && (

          <div className="rounded-xl border border-slate-200
                          bg-white p-5">

            <LoadingSpinner message="Loading ticket statistics..." />

          </div>

        )}

        {stats && (
          <CustomerTicketStats stats={stats} />
        )}

      </div>

      <CustomerTicketHistory
        tickets={tickets}
        status={status}
        loading={ticketsLoading}
        error={ticketsError}
        onStatusChange={handleStatusChange}
        onPageChange={setPage}
        onRetry={handleRetryTickets}
      />

    </div>
  );
};

const AdminCustomerDetailsPage = () => {
  const { customerId } = useParams<{
    customerId: string;
  }>();

  const id = Number(customerId);

  if (
    !customerId ||
    !/^\d+$/.test(customerId) ||
    !Number.isSafeInteger(id) ||
    id <= 0
  ) {
    return (
      <div className="rounded-xl border border-red-200
                      bg-white p-8 text-center">

        <AlertCircle
          size={42}
          className="mx-auto mb-4 text-red-500"
        />

        <h2 className="text-lg font-semibold text-slate-800">
          Invalid Customer ID
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          The requested customer ID is invalid.
        </p>

        <Link
          to="/admin/customers"
          className="mt-5 inline-flex items-center gap-2
                     rounded-lg bg-blue-600 px-5 py-2.5
                     text-sm font-medium text-white
                     hover:bg-blue-700"
        >

          <ArrowLeft size={17} />

          Back to Customers

        </Link>

      </div>
    );
  }

  return (
    <CustomerDetailsContent
      key={id}
      customerId={id}
    />
  );
};

export default AdminCustomerDetailsPage;