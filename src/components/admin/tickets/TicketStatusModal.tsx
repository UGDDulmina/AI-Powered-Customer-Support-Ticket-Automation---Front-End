import { useState, useEffect, useRef } from "react";

import {
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
  Circle,
  Clock,
  Lock,
} from "lucide-react";

import {
  updateAdminTicketStatus,
} from "../../../api/ticketManagement.api";

import type {
  AdminTicket,
  TicketStatus,
} from "../../../types/adminTicket.types";

import type {
  TicketStatusOption,
} from "../../../types/ticketManagement.types";

import {
  getApiErrorMessage,
} from "../../../utils/apiError";

interface TicketStatusModalProps {
  ticket: AdminTicket;
  initialStatus?: TicketStatus;
  onClose: () => void;
  onSuccess: () => void;
}

const statusOptions: TicketStatusOption[] = [
  {
    value: "open",
    label: "Open",
    description: "Waiting for support or investigation.",
  },
  {
    value: "in_progress",
    label: "In Progress",
    description: "The support team is investigating.",
  },
  {
    value: "resolved",
    label: "Resolved",
    description: "A solution has been provided.",
  },
  {
    value: "closed",
    label: "Closed",
    description: "The support request has ended.",
  },
];

const statusIcons = {
  open: Circle,
  in_progress: Clock,
  resolved: CheckCircle2,
  closed: Lock,
};

const statusColors: Record<TicketStatus, string> = {
  open: "text-blue-600",
  in_progress: "text-amber-600",
  resolved: "text-green-600",
  closed: "text-slate-600",
};

const formatStatus = (status: TicketStatus) =>
  status.replace(/_/g, " ");

const TicketStatusModal = ({
  ticket,
  initialStatus,
  onClose,
  onSuccess,
}: TicketStatusModalProps) => {
  const [status, setStatus] = useState<TicketStatus>(
    initialStatus ?? ticket.status
  );

  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);
  const submittingRef = useRef(false);

  const isReopening =
    ticket.status === "closed" && status !== "closed";

  const requiresConfirmation =
    status !== ticket.status &&
    (
      status === "resolved" ||
      status === "closed" ||
      isReopening
    );

  const confirmationMessage = isReopening
    ? "I confirm that this ticket requires further support."
    : status === "resolved"
      ? "I confirm that a suitable solution has been provided."
      : "I confirm that this support request should be closed.";

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

  const handleSubmit = async () => {
    if (
      submittingRef.current ||
      status === ticket.status ||
      (requiresConfirmation && !confirmed)
    ) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      await updateAdminTicketStatus(ticket.id, {
        status,
      });

      onSuccess();
    } catch (error: unknown) {
      setError(getApiErrorMessage(error));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="status-title"
      onCancel={(event) => {
        event.preventDefault();

        if (!submittingRef.current) {
          onClose();
        }
      }}
      className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50"
    >
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <RefreshCw size={22} />
          </div>

          <div>
            <h2
              id="status-title"
              className="text-lg font-semibold text-slate-900"
            >
              Change Ticket Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ticket #{ticket.id}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Close status dialog"
          disabled={submitting}
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
        >
          <X size={22} />
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs text-slate-500">
            Current Status
          </p>

          <p
            className={`mt-1 font-semibold capitalize ${
              statusColors[ticket.status]
            }`}
          >
            {formatStatus(ticket.status)}
          </p>
        </div>

        <fieldset disabled={submitting} className="space-y-3">
          <legend className="mb-3 text-sm font-medium text-slate-700">
            Select New Status
          </legend>

          {statusOptions.map((option) => {
            const StatusIcon = statusIcons[option.value];

            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                  status === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="ticket-status"
                  value={option.value}
                  checked={status === option.value}
                  onChange={() => {
                    setStatus(option.value);
                    setConfirmed(false);
                    setError("");
                  }}
                  className="h-4 w-4 accent-blue-600"
                />

                <StatusIcon
                  size={21}
                  className={statusColors[option.value]}
                />

                <div>
                  <p
                    className={`text-sm font-semibold ${
                      statusColors[option.value]
                    }`}
                  >
                    {option.label}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {option.description}
                  </p>
                </div>
              </label>
            );
          })}
        </fieldset>

        {requiresConfirmation && (
          <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3 text-sm text-amber-800">
              <AlertTriangle size={20} className="shrink-0" />

              <p>
                {isReopening
                  ? "This action will reopen a previously closed ticket."
                  : status === "closed"
                    ? "Closing this ticket marks the support request as completed."
                    : "Resolving this ticket indicates that a solution has been provided."}
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-sm text-amber-900">
              <input
                type="checkbox"
                checked={confirmed}
                disabled={submitting}
                onChange={(event) =>
                  setConfirmed(event.target.checked)
                }
                className="mt-1 h-4 w-4 accent-blue-600"
              />

              <span>{confirmationMessage}</span>
            </label>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 p-5">
        <button
          type="button"
          disabled={submitting}
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={
            submitting ||
            status === ticket.status ||
            (requiresConfirmation && !confirmed)
          }
          onClick={handleSubmit}
          className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 ${
            status === "closed"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {submitting ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <CheckCircle2 size={18} />
          )}

          {submitting ? "Updating..." : "Update Status"}
        </button>
      </div>
    </dialog>
  );
};

export default TicketStatusModal;