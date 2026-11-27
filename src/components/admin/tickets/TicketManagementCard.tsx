import {
  Pencil,
  Flag,
  RefreshCw,
  CheckCircle2,
  Lock,
  Ticket,
  RotateCcw,
} from "lucide-react";

import type {
  AdminTicket,
  TicketStatus,
  TicketPriority,
} from "../../../types/adminTicket.types";

interface TicketManagementCardProps {
  ticket: AdminTicket;
  disabled?: boolean;
  onEdit: () => void;
  onChangePriority: () => void;
  onChangeStatus: (status?: TicketStatus) => void;
}

const statusStyles: Record<TicketStatus, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-slate-200 text-slate-700",
};

const priorityStyles: Record<TicketPriority, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const TicketManagementCard = ({
  ticket,
  disabled = false,
  onEdit,
  onChangePriority,
  onChangeStatus,
}: TicketManagementCardProps) => {
  const isClosed = ticket.status === "closed";
  const isResolved = ticket.status === "resolved";

  const actionClass =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Ticket size={23} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-800">
              Ticket Management
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Manage ticket information and classification.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={onEdit}
          className={`${actionClass} bg-blue-600 text-white hover:bg-blue-700`}
        >
          <Pencil size={17} />
          Edit Ticket
        </button>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              Current Status
            </p>

            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                statusStyles[ticket.status]
              }`}
            >
              {ticket.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              Current Priority
            </p>

            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                priorityStyles[ticket.priority]
              }`}
            >
              {ticket.priority}
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              Category
            </p>

            <p className="mt-3 break-words text-sm font-semibold capitalize text-slate-800">
              {ticket.category || "Uncategorized"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              Ticket ID
            </p>

            <p className="mt-3 text-sm font-semibold text-slate-800">
              #{ticket.id}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            Quick Actions
          </h3>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={disabled}
              onClick={onChangePriority}
              className={`${actionClass} bg-orange-50 text-orange-700 hover:bg-orange-100`}
            >
              <Flag size={17} />
              Change Priority
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => onChangeStatus()}
              className={`${actionClass} bg-blue-50 text-blue-700 hover:bg-blue-100`}
            >
              <RefreshCw size={17} />
              Change Status
            </button>

            {!isClosed && !isResolved && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChangeStatus("resolved")}
                className={`${actionClass} bg-green-50 text-green-700 hover:bg-green-100`}
              >
                <CheckCircle2 size={17} />
                Resolve Ticket
              </button>
            )}

            {!isClosed && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChangeStatus("closed")}
                className={`${actionClass} bg-red-50 text-red-700 hover:bg-red-100`}
              >
                <Lock size={17} />
                Close Ticket
              </button>
            )}

            {(isClosed || isResolved) && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChangeStatus("open")}
                className={`${actionClass} bg-violet-50 text-violet-700 hover:bg-violet-100`}
              >
                <RotateCcw size={17} />
                Reopen Ticket
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TicketManagementCard;