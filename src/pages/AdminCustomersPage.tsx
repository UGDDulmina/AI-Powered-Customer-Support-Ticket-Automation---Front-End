import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import {
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  CheckCircle2,
  X,
} from "lucide-react";

import {
  getAllCustomers,
  calculateCustomerStats,
} from "../api/customers.api";

import type {
  Customer,
  CustomerPhoneFilter,
} from "../types/customer.types";

import CustomerStatsCards from
  "../components/admin/customers/CustomerStatsCards";

import CustomerFilters from
  "../components/admin/customers/CustomerFilters";

import CustomerTable from
  "../components/admin/customers/CustomerTable";

import CustomerFormModal from
  "../components/admin/customers/CustomerFormModal";

import CustomerDeleteModal from
  "../components/admin/customers/CustomerDeleteModal";

import LoadingSpinner from
  "../components/common/LoadingSpinner";

import {
  getApiErrorMessage,
} from "../utils/apiError";

const PAGE_SIZE = 10;

type CustomerModal =
  | { type: "create" }
  | { type: "edit"; customer: Customer }
  | { type: "delete"; customer: Customer }
  | null;

const AdminCustomersPage = () => {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [hasLoaded, setHasLoaded] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [search, setSearch] = useState("");

  const [phoneFilter, setPhoneFilter] =
    useState<CustomerPhoneFilter>("all");

  const [page, setPage] = useState(1);

  const [modal, setModal] =
    useState<CustomerModal>(null);

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const controllerRef =
    useRef<AbortController | null>(null);

  const loadCustomers = useCallback(
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
        const data = await getAllCustomers(
          controller.signal
        );

        if (controller.signal.aborted) {
          return;
        }

        setCustomers(data);

        setHasLoaded(true);

        setLastUpdated(new Date());
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setError(getApiErrorMessage(err));
        }
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
    void loadCustomers();

    return () => {
      controllerRef.current?.abort();
    };
  }, [loadCustomers]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSuccessMessage("");
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [successMessage]);

  const stats = useMemo(
    () => calculateCustomerStats(customers),
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return customers
      .filter((customer) => {
        const matchesSearch =
          !keyword ||
          customer.name.toLowerCase().includes(keyword) ||
          customer.email.toLowerCase().includes(keyword) ||
          (customer.phone ?? "").toLowerCase().includes(keyword) ||
          String(customer.id).includes(keyword);

        const hasPhone = Boolean(customer.phone?.trim());

        const matchesPhoneFilter =
          phoneFilter === "all" ||
          (phoneFilter === "with_phone" && hasPhone) ||
          (phoneFilter === "without_phone" && !hasPhone);

        return matchesSearch && matchesPhoneFilter;
      })
      .sort((a, b) => b.id - a.id);
  }, [customers, search, phoneFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const endIndex = startIndex + PAGE_SIZE;

  const paginatedCustomers = filteredCustomers.slice(
    startIndex,
    endIndex
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);

    setPage(1);
  };

  const handlePhoneFilterChange = (
    value: CustomerPhoneFilter
  ) => {
    setPhoneFilter(value);

    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");

    setPhoneFilter("all");

    setPage(1);
  };

  const handleRefresh = () => {
    if (loading || refreshing || modal) {
      return;
    }

    void loadCustomers(true);
  };

  const handleOpenCreate = () => {
    setSuccessMessage("");

    setModal({ type: "create" });
  };

  const handleOpenEdit = (customer: Customer) => {
    setSuccessMessage("");

    setModal({
      type: "edit",
      customer,
    });
  };

  const handleOpenDelete = (customer: Customer) => {
    setSuccessMessage("");

    setModal({
      type: "delete",
      customer,
    });
  };

  const handleCloseModal = useCallback(() => {
    setModal(null);
  }, []);

  const handleCreateSuccess = (customer: Customer) => {
    setCustomers((previous) => [
      customer,
      ...previous.filter((item) => item.id !== customer.id),
    ]);

    setModal(null);

    setSearch("");

    setPhoneFilter("all");

    setPage(1);

    setSuccessMessage(
      `${customer.name} was added successfully.`
    );

    void loadCustomers(true);
  };

  const handleEditSuccess = (customer: Customer) => {
    setCustomers((previous) =>
      previous.map((item) =>
        item.id === customer.id ? customer : item
      )
    );

    setModal(null);

    setSuccessMessage(
      `${customer.name} was updated successfully.`
    );

    void loadCustomers(true);
  };

  const handleDeleteSuccess = (customer: Customer) => {
    setCustomers((previous) =>
      previous.filter((item) => item.id !== customer.id)
    );

    setModal(null);

    setPage(currentPage);

    setSuccessMessage(
      `${customer.name} was deleted successfully.`
    );

    void loadCustomers(true);
  };

  if (loading && !hasLoaded) {
    return (
      <LoadingSpinner message="Loading customers..." />
    );
  }

  if (error && !hasLoaded) {
    return (
      <div className="rounded-xl border border-red-200
                      bg-white p-8 text-center">

        <AlertCircle
          size={42}
          className="mx-auto mb-4 text-red-500"
        />

        <h2 className="text-lg font-semibold text-slate-800">
          Unable to load customers
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={() => void loadCustomers()}
          className="mt-5 rounded-lg bg-blue-600
                     px-5 py-2.5 text-sm font-medium
                     text-white hover:bg-blue-700"
        >
          Try Again
        </button>

      </div>
    );
  }

  const actionsDisabled =
    loading || refreshing || modal !== null;

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center
                      justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Customer Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage registered customers and their
            contact information.
          </p>

          {lastUpdated && (
            <p className="mt-2 text-xs text-slate-400">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">

          <button
            type="button"
            onClick={handleRefresh}
            disabled={actionsDisabled}
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

          <button
            type="button"
            onClick={handleOpenCreate}
            disabled={actionsDisabled}
            className="flex items-center gap-2 rounded-lg
                       bg-blue-600 px-4 py-2.5 text-sm
                       font-medium text-white shadow-sm
                       hover:bg-blue-700 disabled:opacity-50"
          >
            <UserPlus size={18} />

            Add Customer
          </button>

        </div>

      </div>

      {successMessage && (
        <div
          role="status"
          className="flex items-center justify-between
                     gap-3 rounded-xl border border-green-200
                     bg-green-50 p-4"
        >
          <div className="flex items-center gap-3">

            <CheckCircle2
              size={21}
              className="shrink-0 text-green-600"
            />

            <span className="text-sm font-medium text-green-700">
              {successMessage}
            </span>

          </div>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss success notification"
            className="text-green-600 hover:text-green-800"
          >
            <X size={18} />
          </button>

        </div>
      )}

      {error && hasLoaded && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg
                     border border-red-200 bg-red-50
                     p-4 text-sm text-red-700"
        >
          <AlertCircle size={20} className="shrink-0" />

          <span>
            Refresh failed: {error}.
            Showing the last available data.
          </span>

        </div>
      )}

      <CustomerStatsCards stats={stats} />

      <section className="overflow-hidden rounded-xl
                          border border-slate-200
                          bg-white shadow-sm">

        <div className="border-b border-slate-100 p-5">

          <h2 className="text-lg font-semibold text-slate-800">
            Registered Customers
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View, search and manage customer records.
          </p>

        </div>

        <CustomerFilters
          search={search}
          phoneFilter={phoneFilter}
          onSearchChange={handleSearchChange}
          onPhoneFilterChange={handlePhoneFilterChange}
          onClear={handleClearFilters}
        />

        <CustomerTable
          customers={paginatedCustomers}
          hasFilters={
            search.trim().length > 0 ||
            phoneFilter !== "all"
          }
          disabled={actionsDisabled}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />

        <div className="flex flex-wrap items-center
                        justify-between gap-4
                        border-t border-slate-100 p-5">

          <p className="text-sm text-slate-500">
            Showing{" "}
            {filteredCustomers.length === 0
              ? 0
              : startIndex + 1}
            {" to "}
            {Math.min(endIndex, filteredCustomers.length)}
            {" of "}
            {filteredCustomers.length}
            {" customers"}
          </p>

          <div className="flex items-center gap-3">

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setPage(Math.max(1, currentPage - 1))
              }
              className="flex items-center gap-1 rounded-lg
                         border border-slate-200 px-3 py-2
                         text-sm text-slate-700
                         hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />

              Previous
            </button>

            <span className="text-sm font-medium text-slate-700">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage(Math.min(totalPages, currentPage + 1))
              }
              className="flex items-center gap-1 rounded-lg
                         border border-slate-200 px-3 py-2
                         text-sm text-slate-700
                         hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />

              Next
            </button>

          </div>

        </div>

      </section>

      {modal?.type === "create" && (
        <CustomerFormModal
          onClose={handleCloseModal}
          onSuccess={handleCreateSuccess}
        />
      )}

      {modal?.type === "edit" && (
        <CustomerFormModal
          key={modal.customer.id}
          customer={modal.customer}
          onClose={handleCloseModal}
          onSuccess={handleEditSuccess}
        />
      )}

      {modal?.type === "delete" && (
        <CustomerDeleteModal
          key={modal.customer.id}
          customer={modal.customer}
          onClose={handleCloseModal}
          onSuccess={handleDeleteSuccess}
        />
      )}

    </div>
  );
};

export default AdminCustomersPage;