import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";

import {
  X,
  Pencil,
  Save,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import {
  updateTicketInformation,
} from "../../../api/ticketManagement.api";

import {
  getAdminTicketById,
} from "../../../api/adminTickets.api";

import type {
  AdminTicket,
} from "../../../types/adminTicket.types";

import type {
  TicketEditForm,
} from "../../../types/ticketManagement.types";

import {
  validateTicketSubject,
  validateTicketDescription,
} from "../../../utils/ticketValidation";

import {
  getApiErrorMessage,
} from "../../../utils/apiError";

interface TicketEditModalProps {
  ticket: AdminTicket;
  onClose: () => void;
  onSuccess: () => void;
}

const TicketEditModal = ({
  ticket,
  onClose,
  onSuccess,
}: TicketEditModalProps) => {
  const [form, setForm] = useState<TicketEditForm>({
    subject: ticket.subject,
    description: ticket.description ?? "",
    category: ticket.category ?? "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof TicketEditForm, string>>
  >({});

  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const hasChanges =
    form.subject.trim() !== ticket.subject.trim() ||
    form.description.trim() !==
      (ticket.description ?? "").trim() ||
    form.category.trim() !==
      (ticket.category ?? "").trim();

  const handleChange = (
    field: keyof TicketEditForm,
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

    if (submittingRef.current || !hasChanges) {
      return;
    }

    const validationErrors: Partial<
      Record<keyof TicketEditForm, string>
    > = {};

    const subjectError =
      validateTicketSubject(form.subject);

    const descriptionError =
      validateTicketDescription(form.description);

    if (subjectError) {
      validationErrors.subject = subjectError;
    }

    if (descriptionError) {
      validationErrors.description = descriptionError;
    }

    if (form.category.trim().length > 50) {
      validationErrors.category =
        "Category cannot exceed 50 characters.";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setApiError("");

    try {
      const latestTicket = await getAdminTicketById(
        ticket.id
      );

      const informationChanged =
        latestTicket.subject !== ticket.subject ||
        (latestTicket.description ?? "") !==
          (ticket.description ?? "") ||
        (latestTicket.category ?? "") !==
          (ticket.category ?? "");

      if (informationChanged) {
        setApiError(
          "Ticket information has changed. Close this dialog, refresh the ticket and try again."
        );

        return;
      }

      await updateTicketInformation(ticket.id, {
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: form.category.trim() || null,
        priority: latestTicket.priority,
        status: latestTicket.status,
      });

      onSuccess();
    } catch (error: unknown) {
      setApiError(getApiErrorMessage(error));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const inputClass = (
    field: keyof TicketEditForm
  ) =>
    `w-full rounded-lg border px-4 py-3 text-sm
    outline-none disabled:bg-slate-100 ${
      errors[field]
        ? "border-red-400 focus:ring-2 focus:ring-red-100"
        : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    }`;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="edit-ticket-title"
      onCancel={(event) => {
        event.preventDefault();

        if (!submittingRef.current) {
          onClose();
        }
      }}
      className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50"
    >
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Pencil size={22} />
          </div>

          <div>
            <h2
              id="edit-ticket-title"
              className="text-lg font-semibold text-slate-900"
            >
              Edit Ticket
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ticket #{ticket.id}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Close edit dialog"
          disabled={submitting}
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
        >
          <X size={22} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5 p-5">
          <div>
            <label
              htmlFor="edit-subject"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Subject *
            </label>

            <input
              id="edit-subject"
              type="text"
              value={form.subject}
              maxLength={200}
              disabled={submitting}
              aria-invalid={Boolean(errors.subject)}
              onChange={(event) =>
                handleChange("subject", event.target.value)
              }
              className={inputClass("subject")}
            />

            {errors.subject && (
              <p className="mt-2 text-xs text-red-600">
                {errors.subject}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Description *
            </label>

            <textarea
              id="edit-description"
              rows={6}
              value={form.description}
              disabled={submitting}
              aria-invalid={Boolean(errors.description)}
              onChange={(event) =>
                handleChange(
                  "description",
                  event.target.value
                )
              }
              className={`${inputClass("description")} resize-y`}
            />

            {errors.description && (
              <p className="mt-2 text-xs text-red-600">
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-category"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Category
            </label>

            <input
              id="edit-category"
              type="text"
              value={form.category}
              maxLength={50}
              disabled={submitting}
              aria-invalid={Boolean(errors.category)}
              onChange={(event) =>
                handleChange("category", event.target.value)
              }
              placeholder="Enter ticket category"
              className={inputClass("category")}
            />

            {errors.category && (
              <p className="mt-2 text-xs text-red-600">
                {errors.category}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            Existing customer information, agent assignment,
            priority and status are not intentionally changed
            by this form.
          </div>

          {apiError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={20} className="shrink-0" />
              <span>{apiError}</span>
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
            type="submit"
            disabled={submitting || !hasChanges}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}

            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </dialog>
  );
};

export default TicketEditModal;