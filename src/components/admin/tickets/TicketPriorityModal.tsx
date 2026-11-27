import { useState, useEffect, useRef } from "react";

import {
  Flag,
  X,
  Save,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import {
  updateAdminTicketPriority,
} from "../../../api/ticketManagement.api";

import type {
  AdminTicket,
  TicketPriority,
} from "../../../types/adminTicket.types";

import type {
  TicketPriorityOption,
} from "../../../types/ticketManagement.types";

import {
  getApiErrorMessage,
} from "../../../utils/apiError";

interface TicketPriorityModalProps {
  ticket: AdminTicket;
  onClose: () => void;
  onSuccess: () => void;
}

const priorityOptions: TicketPriorityOption[] = [
  {
    value: "low",
    label: "Low",
    description: "General inquiries and minor issues.",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Normal customer support requests.",
  },
  {
    value: "high",
    label: "High",
    description: "Issues with significant customer impact.",
  },
  {
    value: "urgent",
    label: "Urgent",
    description: "Critical issues requiring immediate attention.",
  },
];

const priorityColors: Record<TicketPriority, string> = {
  low: "text-green-600",
  medium: "text-blue-600",
  high: "text-orange-600",
  urgent: "text-red-600",
};

const TicketPriorityModal = ({
  ticket,
  onClose,
  onSuccess,
}: TicketPriorityModalProps) => {
  const [priority, setPriority] =
    useState<TicketPriority>(ticket.priority);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);
  const submittingRef = useRef(false);

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
      priority === ticket.priority
    ) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      await updateAdminTicketPriority(ticket.id, {
        priority,
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
      aria-labelledby="priority-title"
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
          <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
            <Flag size={22} />
          </div>

          <div>
            <h2
              id="priority-title"
              className="text-lg font-semibold text-slate-900"
            >
              Change Priority
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ticket #{ticket.id}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Close priority dialog"
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
            Current Priority
          </p>

          <p
            className={`mt-1 font-semibold capitalize ${
              priorityColors[ticket.priority]
            }`}
          >
            {ticket.priority}
          </p>
        </div>

        <fieldset disabled={submitting} className="space-y-3">
          <legend className="mb-3 text-sm font-medium text-slate-700">
            Select New Priority
          </legend>

          {priorityOptions.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                priority === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="ticket-priority"
                value={option.value}
                checked={priority === option.value}
                onChange={() => {
                  setPriority(option.value);
                  setError("");
                }}
                className="h-4 w-4 accent-blue-600"
              />

              <Flag
                size={20}
                className={priorityColors[option.value]}
              />

              <div>
                <p
                  className={`text-sm font-semibold ${
                    priorityColors[option.value]
                  }`}
                >
                  {option.label}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </fieldset>

        {priority !== ticket.priority && (
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            Change priority from{" "}
            <strong className="capitalize">
              {ticket.priority}
            </strong>{" "}
            to{" "}
            <strong className="capitalize">
              {priority}
            </strong>.
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
            submitting || priority === ticket.priority
          }
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}

          {submitting ? "Updating..." : "Update Priority"}
        </button>
      </div>
    </dialog>
  );
};

export default TicketPriorityModal;