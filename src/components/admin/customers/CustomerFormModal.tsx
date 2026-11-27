import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";

import {
  UserPlus,
  Pencil,
  UserRound,
  Mail,
  Phone,
  X,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import axios from "axios";

import {
  createCustomer,
  updateCustomer,
} from "../../../api/customers.api";

import type {
  Customer,
  CustomerFormData,
} from "../../../types/customer.types";

import {
  validateCustomerForm,
} from "../../../utils/customerValidation";

import type {
  CustomerFormErrors,
} from "../../../utils/customerValidation";

import {
  getApiErrorMessage,
} from "../../../utils/apiError";

interface CustomerFormModalProps {
  customer?: Customer;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
}

const CustomerFormModal = ({
  customer,
  onClose,
  onSuccess,
}: CustomerFormModalProps) => {
  const isEditing = Boolean(customer);

  const [form, setForm] = useState<CustomerFormData>({
    name: customer?.name ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
  });

  const [errors, setErrors] =
    useState<CustomerFormErrors>({});

  const [apiError, setApiError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const submittingRef = useRef(false);

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog?.showModal();

    return () => {
      dialog?.close();
    };
  }, []);

  const handleChange = (
    field: keyof CustomerFormData,
    value: string
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
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    setApiError("");

    const validationErrors = validateCustomerForm(form);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    submittingRef.current = true;

    setSubmitting(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
    };

    let savedCustomer: Customer;

    try {
      savedCustomer = customer
        ? await updateCustomer(customer.id, payload)
        : await createCustomer(payload);
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 409
      ) {
        setErrors((previous) => ({
          ...previous,
          email: "This email may already be registered.",
        }));

        setApiError(getApiErrorMessage(error));
      } else {
        setApiError(getApiErrorMessage(error));
      }

      return;
    } finally {
      submittingRef.current = false;

      setSubmitting(false);
    }

    onSuccess(savedCustomer);
  };

  const inputClass = (
    field: keyof CustomerFormData
  ) =>
    `w-full rounded-lg border bg-white
     py-2.5 pl-10 pr-4 text-sm outline-none
     focus:border-blue-500 focus:ring-2
     focus:ring-blue-100 disabled:bg-slate-100
     ${
       errors[field]
         ? "border-red-400"
         : "border-slate-200"
     }`;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="customer-form-title"
      onCancel={(event) => {
        event.preventDefault();

        if (!submittingRef.current) {
          onClose();
        }
      }}
      className="fixed inset-0 m-auto
                 max-h-[90vh] w-[calc(100%-2rem)]
                 max-w-lg overflow-y-auto
                 rounded-2xl bg-white p-0
                 shadow-2xl backdrop:bg-slate-900/50"
    >
      <div className="flex items-center justify-between
                      gap-4 border-b border-slate-100 p-6">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-blue-50
                          p-3 text-blue-600">
            {isEditing
              ? <Pencil size={24} />
              : <UserPlus size={24} />}
          </div>

          <div>
            <h2
              id="customer-form-title"
              className="text-xl font-semibold
                         text-slate-900"
            >
              {isEditing
                ? "Edit Customer"
                : "Add Customer"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {isEditing
                ? "Update customer information"
                : "Enter customer contact information"}
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close customer form"
          className="rounded-lg p-2 text-slate-400
                     hover:bg-slate-100
                     disabled:opacity-50"
        >
          <X size={22} />
        </button>

      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={submitting}
      >
        <div className="space-y-5 p-6">

          {apiError && (
            <div
              role="alert"
              className="flex items-start gap-3
                         rounded-lg border border-red-200
                         bg-red-50 p-3 text-sm text-red-700"
            >
              <AlertCircle size={19} className="shrink-0" />

              {apiError}
            </div>
          )}

          {customer && (
            <div className="rounded-lg bg-slate-50
                            p-3 text-sm text-slate-600">
              Customer #{customer.id}
            </div>
          )}

          <div>
            <label
              htmlFor="customer-name"
              className="mb-2 block text-sm
                         font-medium text-slate-700"
            >
              Full Name *
            </label>

            <div className="relative">

              <UserRound
                size={18}
                className="absolute left-3 top-1/2
                           -translate-y-1/2 text-slate-400"
              />

              <input
                id="customer-name"
                type="text"
                autoFocus
                autoComplete="name"
                required
                maxLength={100}
                value={form.name}
                disabled={submitting}
                aria-invalid={Boolean(errors.name)}
                onChange={(event) =>
                  handleChange("name", event.target.value)
                }
                placeholder="Enter customer name"
                className={inputClass("name")}
              />

            </div>

            {errors.name && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="customer-email"
              className="mb-2 block text-sm
                         font-medium text-slate-700"
            >
              Email Address *
            </label>

            <div className="relative">

              <Mail
                size={18}
                className="absolute left-3 top-1/2
                           -translate-y-1/2 text-slate-400"
              />

              <input
                id="customer-email"
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                value={form.email}
                disabled={submitting}
                aria-invalid={Boolean(errors.email)}
                onChange={(event) =>
                  handleChange("email", event.target.value)
                }
                placeholder="Enter email address"
                className={inputClass("email")}
              />

            </div>

            {errors.email && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="customer-phone"
              className="mb-2 block text-sm
                         font-medium text-slate-700"
            >
              Phone Number

              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <div className="relative">

              <Phone
                size={18}
                className="absolute left-3 top-1/2
                           -translate-y-1/2 text-slate-400"
              />

              <input
                id="customer-phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                value={form.phone}
                disabled={submitting}
                aria-invalid={Boolean(errors.phone)}
                onChange={(event) =>
                  handleChange("phone", event.target.value)
                }
                placeholder="Enter phone number"
                className={inputClass("phone")}
              />

            </div>

            {errors.phone && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.phone}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-blue-100
                          bg-blue-50 p-3 text-xs
                          leading-relaxed text-blue-700">
            {isEditing
              ? "Updating customer information will preserve existing ticket associations."
              : "This creates a customer record. Customer login credentials will be managed separately."}
          </div>

        </div>

        <div className="flex flex-wrap justify-end gap-3
                        border-t border-slate-100
                        bg-slate-50 p-5">

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200
                       bg-white px-5 py-2.5 text-sm
                       font-medium text-slate-700
                       hover:bg-slate-100
                       disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg
                       bg-blue-600 px-5 py-2.5 text-sm
                       font-medium text-white
                       hover:bg-blue-700
                       disabled:opacity-50"
          >
            {submitting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {isEditing
                  ? <Pencil size={17} />
                  : <UserPlus size={17} />}

                {isEditing
                  ? "Save Changes"
                  : "Add Customer"}
              </>
            )}
          </button>

        </div>
      </form>
    </dialog>
  );
};

export default CustomerFormModal;