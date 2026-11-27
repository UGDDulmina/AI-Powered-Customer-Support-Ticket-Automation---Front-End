import { useState, useEffect, useRef } from "react";

import {
  X,
  Trash2,
  AlertTriangle,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import {
  deleteCustomer,
  getCustomerTickets,
} from "../../../api/customers.api";

import type { Customer } from "../../../types/customer.types";

import { getApiErrorMessage } from "../../../utils/apiError";

interface CustomerDeleteModalProps {
  customer: Customer;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
}

const CustomerDeleteModal = ({
  customer,
  onClose,
  onSuccess,
}: CustomerDeleteModalProps) => {
  const [deleting, setDeleting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [ticketCount, setTicketCount] = useState<number | null>(null);
  const [error, setError] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);
  const deletingRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const checkTickets = async () => {
      setChecking(true);
      setError("");
      setTicketCount(null);

      try {
        const response = await getCustomerTickets(
          customer.id,
          {
            page: 1,
            limit: 1,
          },
          controller.signal
        );

        if (!controller.signal.aborted) {
          setTicketCount(response.total);
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setError(getApiErrorMessage(error));
        }
      } finally {
        if (!controller.signal.aborted) {
          setChecking(false);
        }
      }
    };

    void checkTickets();

    return () => {
      controller.abort();
    };
  }, [customer.id]);

  const handleDelete = async () => {
    if (
      deletingRef.current ||
      checking ||
      ticketCount !== 0
    ) {
      return;
    }

    deletingRef.current = true;
    setDeleting(true);
    setError("");

    try {
      const response = await getCustomerTickets(
        customer.id,
        {
          page: 1,
          limit: 1,
        }
      );

      if (response.total !== 0) {
        setTicketCount(response.total);
        setError(
          "This customer has associated tickets and cannot be deleted."
        );
        return;
      }

      await deleteCustomer(customer.id);

      onSuccess(customer);
    } catch (error: unknown) {
      setError(getApiErrorMessage(error));
    } finally {
      deletingRef.current = false;
      setDeleting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="delete-customer-title"
      onCancel={(event) => {
        event.preventDefault();

        if (!deletingRef.current) {
          onClose();
        }
      }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50"
    >
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-3 text-red-600">
            <Trash2 size={23} />
          </div>

          <h2
            id="delete-customer-title"
            className="text-lg font-semibold text-slate-900"
          >
            Delete Customer
          </h2>
        </div>

        <button
          type="button"
          aria-label="Close delete dialog"
          disabled={deleting}
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
        >
          <X size={22} />
        </button>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this customer?
          This action cannot be undone.
        </p>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-800">
            {customer.name}
          </p>

          <p className="mt-1 break-all text-sm text-slate-500">
            {customer.email}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Customer #{customer.id}
          </p>
        </div>

        {checking && (
          <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
            <LoaderCircle
              size={20}
              className="animate-spin"
            />

            Checking associated tickets...
          </div>
        )}

        {!checking &&
          ticketCount !== null &&
          ticketCount > 0 && (
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              <AlertTriangle
                size={20}
                className="shrink-0"
              />

              <p>
                This customer has {ticketCount} associated
                ticket(s). Customers with existing tickets
                cannot be deleted.
              </p>
            </div>
          )}

        {!checking && ticketCount === 0 && (
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle
              size={20}
              className="shrink-0"
            />

            <p>
              This customer has no associated tickets.
              Deleting this customer will permanently
              remove their account information.
            </p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle
              size={20}
              className="shrink-0"
            />

            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 p-5">
        <button
          type="button"
          disabled={deleting}
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={
            deleting ||
            checking ||
            ticketCount !== 0
          }
          onClick={handleDelete}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? (
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
          ) : (
            <Trash2 size={18} />
          )}

          {deleting ? "Deleting..." : "Delete Customer"}
        </button>
      </div>
    </dialog>
  );
};

export default CustomerDeleteModal;