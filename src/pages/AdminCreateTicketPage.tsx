import {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";

import type { FormEvent } from "react";

import {
  ArrowLeft,
  Ticket,
  UserRound,
  Sparkles,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Plus,
  Search,
  RefreshCw,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  createAdminTicket,
  analyzeTicket,
} from "../api/adminTickets.api";

import {
  getAllCustomers,
} from "../api/customers.api";

import type {
  Customer,
} from "../types/customer.types";

import type {
  AdminTicketCreateForm,
  TicketPredictionResult,
} from "../types/adminTicket.types";

import {
  validateTicketForm,
  validateTicketSubject,
  validateTicketDescription,
} from "../utils/ticketValidation";

import type {
  TicketFormErrors,
} from "../utils/ticketValidation";

import {
  getApiErrorMessage,
} from "../utils/apiError";

const initialForm: AdminTicketCreateForm = {
  customerId: "",
  subject: "",
  description: "",
  priority: "medium",
  category: "",
};

const AdminCreateTicketPage = () => {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<AdminTicketCreateForm>(initialForm);

  const [errors, setErrors] =
    useState<TicketFormErrors>({});

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [customersLoading, setCustomersLoading] =
    useState(true);

  const [customersError, setCustomersError] =
    useState("");

  const [customerRetryKey, setCustomerRetryKey] =
    useState(0);

  const [prediction, setPrediction] =
    useState<TicketPredictionResult | null>(null);

  const [predictionError, setPredictionError] =
    useState("");

  const [analyzing, setAnalyzing] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [apiError, setApiError] =
    useState("");

  const submittingRef = useRef(false);

  const analyzingRef = useRef(false);

  const predictionControllerRef =
    useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadCustomers = async () => {
      setCustomersLoading(true);
      setCustomersError("");

      try {
        const data = await getAllCustomers(
          controller.signal
        );

        if (!controller.signal.aborted) {
          setCustomers(
            [...data].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          );
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setCustomersError(
            getApiErrorMessage(error)
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCustomersLoading(false);
        }
      }
    };

    void loadCustomers();

    return () => {
      controller.abort();
    };
  }, [customerRetryKey]);

  useEffect(() => {
    return () => {
      predictionControllerRef.current?.abort();
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = customerSearch
      .trim()
      .toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      String(customer.id).includes(query) ||
      customer.phone?.includes(query) ||
      String(customer.id) === form.customerId
    );
  }, [
    customers,
    customerSearch,
    form.customerId,
  ]);

  const selectedCustomer = customers.find(
    (customer) =>
      String(customer.id) === form.customerId
  );

  const handleChange = <
    K extends keyof AdminTicketCreateForm
  >(
    field: K,
    value: AdminTicketCreateForm[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => {
      const next = { ...previous };

      delete next[field];

      return next;
    });

    setApiError("");

    if (
      field === "subject" ||
      field === "description"
    ) {
      predictionControllerRef.current?.abort();
      analyzingRef.current = false;
      setAnalyzing(false);
      setPrediction(null);
      setPredictionError("");
    }
  };

  const handleAnalyze = async () => {
    if (
      analyzingRef.current ||
      submittingRef.current
    ) {
      return;
    }

    const subjectError =
      validateTicketSubject(form.subject);

    const descriptionError =
      validateTicketDescription(form.description);

    if (subjectError || descriptionError) {
      setErrors((previous) => {
        const next = { ...previous };

        if (subjectError) {
          next.subject = subjectError;
        } else {
          delete next.subject;
        }

        if (descriptionError) {
          next.description = descriptionError;
        } else {
          delete next.description;
        }

        return next;
      });

      return;
    }

    predictionControllerRef.current?.abort();

    const controller = new AbortController();

    predictionControllerRef.current = controller;

    analyzingRef.current = true;

    setAnalyzing(true);
    setPredictionError("");
    setPrediction(null);

    try {
      const result = await analyzeTicket(
        {
          subject: form.subject,
          description: form.description,
        },
        controller.signal
      );

      if (!controller.signal.aborted) {
        setPrediction(result);
      }
    } catch (error: unknown) {
      if (!controller.signal.aborted) {
        setPredictionError(
          getApiErrorMessage(error)
        );
      }
    } finally {
      if (
        predictionControllerRef.current === controller &&
        !controller.signal.aborted
      ) {
        analyzingRef.current = false;
        setAnalyzing(false);
      }
    }
  };

  const handleApplyPrediction = () => {
    if (!prediction || submittingRef.current) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      category: prediction.category,
      priority: prediction.priority,
    }));

    setErrors((previous) => {
      const next = { ...previous };

      delete next.category;
      delete next.priority;

      return next;
    });

    setApiError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      submittingRef.current ||
      analyzingRef.current
    ) {
      return;
    }

    const validationErrors =
      validateTicketForm(form);

    if (!selectedCustomer) {
      validationErrors.customerId =
        "Please select an existing customer.";
    }

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      return;
    }

    submittingRef.current = true;

    setSubmitting(true);
    setApiError("");

    try {
      const ticket = await createAdminTicket({
        customer_id: Number(form.customerId),
        subject: form.subject.trim(),
        description: form.description.trim(),
        priority: form.priority,
        category: form.category.trim() || null,
      });

      if (
        Number.isSafeInteger(ticket.id) &&
        ticket.id > 0
      ) {
        navigate(
          `/admin/tickets/${ticket.id}`,
          { replace: true }
        );
      } else {
        navigate(
          "/admin/tickets",
          { replace: true }
        );
      }
    } catch (error: unknown) {
      setApiError(getApiErrorMessage(error));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const getInputClass = (
    field: keyof AdminTicketCreateForm
  ) =>
    `w-full rounded-lg border bg-white px-4 py-3
     text-sm text-slate-700 outline-none
     transition-colors disabled:bg-slate-100
     ${
       errors[field]
         ? "border-red-400 focus:ring-2 focus:ring-red-100"
         : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
     }`;

  const predictionApplied =
    prediction !== null &&
    form.category === prediction.category &&
    form.priority === prediction.priority;

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      <Link
        to="/admin/tickets"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft size={18} />
        Back to Tickets
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Create Support Ticket
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a support request on behalf of a customer.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6"
      >

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center gap-3 border-b border-slate-100 p-5">

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <UserRound size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Customer Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Select the customer requesting support.
              </p>
            </div>

          </div>

          <div className="space-y-4 p-5">

            {customersError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} />
                  {customersError}
                </div>

                <button
                  type="button"
                  disabled={customersLoading || submitting}
                  onClick={() =>
                    setCustomerRetryKey((value) => value + 1)
                  }
                  className="mt-3 inline-flex items-center gap-2 font-medium underline"
                >
                  <RefreshCw size={15} />
                  Retry
                </button>
              </div>
            )}

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                aria-label="Search customers"
                value={customerSearch}
                disabled={customersLoading || submitting}
                onChange={(event) =>
                  setCustomerSearch(event.target.value)
                }
                placeholder="Search customer by name, email or ID..."
                className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
              />

            </div>

            <div>

              <label
                htmlFor="customerId"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Customer *
              </label>

              <select
                id="customerId"
                value={form.customerId}
                disabled={customersLoading || submitting}
                onChange={(event) =>
                  handleChange(
                    "customerId",
                    event.target.value
                  )
                }
                aria-invalid={Boolean(errors.customerId)}
                className={getInputClass("customerId")}
              >
                <option value="">
                  {customersLoading
                    ? "Loading customers..."
                    : "Select a customer"}
                </option>

                {filteredCustomers.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>

              {errors.customerId && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.customerId}
                </p>
              )}

              {!customersLoading &&
                !customersError &&
                filteredCustomers.length === 0 && (
                  <p className="mt-2 text-sm text-slate-500">
                    No matching customers found.
                  </p>
                )}

            </div>

            {selectedCustomer && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">

                <p className="font-semibold text-blue-900">
                  {selectedCustomer.name}
                </p>

                <p className="mt-1 text-sm text-blue-700">
                  {selectedCustomer.email}
                </p>

                <p className="mt-1 text-xs text-blue-600">
                  Customer #{selectedCustomer.id}
                  {" | "}
                  {selectedCustomer.phone || "No phone number"}
                </p>

              </div>
            )}

            {!customersLoading &&
              !customersError &&
              customers.length === 0 && (
                <Link
                  to="/admin/customers"
                  className="inline-block text-sm font-medium text-blue-600 hover:underline"
                >
                  Register a customer first
                </Link>
              )}

          </div>

        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center gap-3 border-b border-slate-100 p-5">

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Ticket size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Ticket Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Describe the customer's support request.
              </p>
            </div>

          </div>

          <div className="space-y-5 p-5">

            <div>

              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Subject *
              </label>

              <input
                id="subject"
                type="text"
                value={form.subject}
                maxLength={200}
                disabled={submitting}
                onChange={(event) =>
                  handleChange("subject", event.target.value)
                }
                placeholder="Enter ticket subject"
                aria-invalid={Boolean(errors.subject)}
                className={getInputClass("subject")}
              />

              <div className="mt-2 flex justify-between gap-3">

                <p className="text-xs text-red-600">
                  {errors.subject}
                </p>

                <p className="text-xs text-slate-400">
                  {form.subject.length}/200
                </p>

              </div>

            </div>

            <div>

              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description *
              </label>

              <textarea
                id="description"
                value={form.description}
                rows={6}
                disabled={submitting}
                onChange={(event) =>
                  handleChange(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Describe the customer's issue in detail..."
                aria-invalid={Boolean(errors.description)}
                className={`${getInputClass("description")} resize-y`}
              />

              <div className="mt-2 flex justify-between gap-3">

                <p className="text-xs text-red-600">
                  {errors.description}
                </p>

                <p className="text-xs text-slate-400">
                  {form.description.length} characters
                </p>

              </div>

            </div>

          </div>

        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center gap-3 border-b border-slate-100 p-5">

            <div className="rounded-lg bg-violet-50 p-3 text-violet-600">
              <Sparkles size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                AI Ticket Classification
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Generate category and priority recommendations.
              </p>
            </div>

          </div>

          <div className="space-y-5 p-5">

            <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">

              <p className="text-sm text-violet-800">
                Analyze the ticket subject and description
                to generate classification suggestions.
                You can review and modify the results
                before creating the ticket.
              </p>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing || submitting}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              >

                {analyzing ? (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Sparkles size={18} />
                )}

                {analyzing
                  ? "Analyzing Ticket..."
                  : "Analyze Ticket"}

              </button>

            </div>

            {predictionError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >

                <AlertCircle
                  size={20}
                  className="shrink-0"
                />

                <div>
                  <p className="font-medium">
                    Ticket analysis failed
                  </p>

                  <p className="mt-1">
                    {predictionError}
                  </p>

                  <p className="mt-2">
                    You can still enter the category
                    and priority manually.
                  </p>
                </div>

              </div>
            )}

            {prediction && (
              <div className="space-y-4 rounded-xl border border-violet-200 bg-white p-5">

                <div className="flex items-center gap-2 text-violet-700">
                  <CheckCircle2 size={20} />

                  <h3 className="font-semibold">
                    Analysis Results
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="rounded-lg bg-slate-50 p-4">

                    <p className="text-xs font-medium text-slate-500">
                      Suggested Category
                    </p>

                    <p className="mt-2 font-semibold capitalize text-slate-800">
                      {prediction.category}
                    </p>

                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">

                    <p className="text-xs font-medium text-slate-500">
                      Suggested Priority
                    </p>

                    <p className="mt-2 font-semibold capitalize text-slate-800">
                      {prediction.priority}
                    </p>

                  </div>

                </div>

                {prediction.reason && (
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Prediction Reason
                    </p>

                    <p className="mt-2 text-sm text-slate-700">
                      {prediction.reason}
                    </p>
                  </div>
                )}

                {prediction.matchedKeywords.length > 0 && (
                  <div>

                    <p className="mb-2 text-xs font-medium text-slate-500">
                      Matched Keywords
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {prediction.matchedKeywords.map(
                        (keyword, index) => (
                          <span
                            key={`${keyword}-${index}`}
                            className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
                          >
                            {keyword}
                          </span>
                        )
                      )}

                    </div>

                  </div>
                )}

                <button
                  type="button"
                  onClick={handleApplyPrediction}
                  disabled={predictionApplied || submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                >

                  <CheckCircle2 size={17} />

                  {predictionApplied
                    ? "Suggestions Applied"
                    : "Apply Suggestions"}

                </button>

              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>

                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Category
                </label>

                <input
                  id="category"
                  type="text"
                  value={form.category}
                  maxLength={50}
                  disabled={submitting}
                  onChange={(event) =>
                    handleChange(
                      "category",
                      event.target.value
                    )
                  }
                  placeholder="Enter category"
                  aria-invalid={Boolean(errors.category)}
                  className={getInputClass("category")}
                />

                {errors.category && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.category}
                  </p>
                )}

              </div>

              <div>

                <label
                  htmlFor="priority"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Priority *
                </label>

                <select
                  id="priority"
                  value={form.priority}
                  disabled={submitting}
                  onChange={(event) =>
                    handleChange(
                      "priority",
                      event.target.value as AdminTicketCreateForm["priority"]
                    )
                  }
                  aria-invalid={Boolean(errors.priority)}
                  className={getInputClass("priority")}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>

                {errors.priority && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.priority}
                  </p>
                )}

              </div>

            </div>

          </div>

        </section>

        {apiError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >

            <AlertCircle
              size={20}
              className="shrink-0"
            />

            <div>
              <p className="font-medium">
                Unable to create ticket
              </p>

              <p className="mt-1">
                {apiError}
              </p>
            </div>

          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <button
            type="button"
            disabled={submitting}
            onClick={() => navigate("/admin/tickets")}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              analyzing ||
              customersLoading ||
              Boolean(customersError) ||
              customers.length === 0
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >

            {submitting ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <Plus size={18} />
            )}

            {submitting
              ? "Creating Ticket..."
              : "Create Ticket"}

          </button>

        </div>

      </form>

    </div>
  );
};

export default AdminCreateTicketPage;