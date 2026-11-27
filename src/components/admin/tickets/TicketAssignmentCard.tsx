import {
  UserRound,
  UserPlus,
  UserCheck,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import type {
  AdminTicket,
} from "../../../types/adminTicket.types";

import type {
  Agent,
} from "../../../types/agent.types";

interface TicketAssignmentCardProps {
  ticket: AdminTicket;
  agent?: Agent;
  agentLookupAvailable: boolean;
  disabled?: boolean;
  onAssign: () => void;
}

const TicketAssignmentCard = ({
  ticket,
  agent,
  agentLookupAvailable,
  disabled = false,
  onAssign,
}: TicketAssignmentCardProps) => {
  const isAssigned =
    ticket.assigned_agent_id != null;

  const isClosed = ticket.status === "closed";

  const agentName =
    agent?.name ||
    ticket.assigned_agent_name ||
    (
      isAssigned
        ? `Agent #${ticket.assigned_agent_id}`
        : "Unassigned"
    );

  const hasAccountWarning =
    agent &&
    (
      !agent.is_active ||
      !agent.has_password ||
      agent.role !== "agent"
    );

  const initials = agentName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <UserCheck size={22} />
          </div>

          <div>

            <h2 className="font-semibold text-slate-800">
              Agent Assignment
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Manage the support agent responsible for this ticket.
            </p>

          </div>

        </div>

        <button
          type="button"
          disabled={disabled || isClosed}
          onClick={onAssign}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >

          {isAssigned ? (
            <RefreshCw size={17} />
          ) : (
            <UserPlus size={17} />
          )}

          {isAssigned
            ? "Reassign Agent"
            : "Assign Agent"}

        </button>

      </div>

      <div className="space-y-4 p-5">

        {isAssigned ? (

          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">

              {initials}

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-xs text-slate-500">
                Currently Assigned Agent
              </p>

              <h3 className="mt-1 font-semibold text-slate-800">
                {agentName}
              </h3>

              {agent?.email && (
                <p className="mt-1 break-all text-sm text-slate-500">
                  {agent.email}
                </p>
              )}

              <p className="mt-1 text-xs text-slate-400">
                Agent #{ticket.assigned_agent_id}
              </p>

            </div>

            {agent && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  agent.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {agent.is_active
                  ? "Active"
                  : "Inactive"}
              </span>
            )}

          </div>

        ) : (

          <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4">

            <div className="rounded-full bg-amber-100 p-3 text-amber-600">
              <UserRound size={24} />
            </div>

            <div>

              <h3 className="font-semibold text-amber-800">
                No Agent Assigned
              </h3>

              <p className="mt-1 text-sm text-amber-700">
                This ticket is waiting for a support agent.
              </p>

            </div>

          </div>

        )}

        {hasAccountWarning && (
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">

            <AlertTriangle
              size={20}
              className="shrink-0"
            />

            <p>
              The currently assigned account does not meet
              the eligibility requirements for new assignments.
              Consider reassigning this ticket.
            </p>

          </div>
        )}

        {isAssigned &&
          agentLookupAvailable &&
          !agent && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              The assigned agent account could not be found
              in the agent directory.
            </div>
          )}

        {!agentLookupAvailable && (
          <p className="text-xs text-slate-500">
            Agent account information is currently unavailable.
          </p>
        )}

        {isClosed && (
          <p className="text-xs text-slate-500">
            Closed tickets cannot be reassigned from this page.
          </p>
        )}

      </div>

    </section>
  );
};

export default TicketAssignmentCard;