import {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  X,
  Search,
  UserRound,
  UserCheck,
  LoaderCircle,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import {
  getAssignableAgents,
  assignTicketAgent,
} from "../../../api/ticketAssignment.api";

import type {
  AdminTicket,
} from "../../../types/adminTicket.types";

import type {
  AssignableAgent,
} from "../../../types/ticketAssignment.types";

import {
  getApiErrorMessage,
} from "../../../utils/apiError";

interface AgentAssignmentModalProps {
  ticket: AdminTicket;
  currentAgentName: string;
  onClose: () => void;
  onSuccess: (agent: AssignableAgent) => void;
}

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase() || "A";

const AgentAssignmentModal = ({
  ticket,
  currentAgentName,
  onClose,
  onSuccess,
}: AgentAssignmentModalProps) => {
  const [agents, setAgents] =
    useState<AssignableAgent[]>([]);

  const [selectedAgentId, setSelectedAgentId] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const [submitError, setSubmitError] =
    useState("");

  const [workloadAvailable, setWorkloadAvailable] =
    useState(true);

  const [retryKey, setRetryKey] = useState(0);

  const dialogRef =
    useRef<HTMLDialogElement>(null);

  const submittingRef = useRef(false);

  const isReassignment =
    ticket.assigned_agent_id != null;

  const actionLabel = isReassignment
    ? "Reassign Agent"
    : "Assign Agent";

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

    const loadAgents = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const result = await getAssignableAgents(
          controller.signal
        );

        if (controller.signal.aborted) {
          return;
        }

        setAgents(result.agents);

        setWorkloadAvailable(
          result.workloadAvailable
        );

        setSelectedAgentId((previous) =>
          result.agents.some(
            (agent) =>
              agent.id === previous &&
              agent.id !== ticket.assigned_agent_id
          )
            ? previous
            : null
        );
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setLoadError(
            getApiErrorMessage(error)
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadAgents();

    return () => {
      controller.abort();
    };
  }, [retryKey, ticket.assigned_agent_id]);

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return agents.filter(
      (agent) =>
        !query ||
        agent.name.toLowerCase().includes(query) ||
        agent.email.toLowerCase().includes(query) ||
        String(agent.id).includes(query)
    );
  }, [agents, search]);

  const selectedAgent = agents.find(
    (agent) => agent.id === selectedAgentId
  );

  const handleAssign = async () => {
    if (
      submittingRef.current ||
      !selectedAgent ||
      loading ||
      loadError ||
      selectedAgent.id === ticket.assigned_agent_id
    ) {
      return;
    }

    submittingRef.current = true;

    setSubmitting(true);
    setSubmitError("");

    try {
      await assignTicketAgent(ticket.id, {
        agent_id: selectedAgent.id,
      });
    } catch (error: unknown) {
      setSubmitError(
        getApiErrorMessage(error)
      );

      return;
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }

    onSuccess(selectedAgent);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="assignment-title"
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
            <UserCheck size={23} />
          </div>

          <div>
            <h2
              id="assignment-title"
              className="text-lg font-semibold text-slate-900"
            >
              {actionLabel}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ticket #{ticket.id}
            </p>
          </div>

        </div>

        <button
          type="button"
          aria-label="Close assignment dialog"
          disabled={submitting}
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
        >
          <X size={22} />
        </button>

      </div>

      <div className="space-y-5 p-5">

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

          <p className="text-xs font-medium text-slate-500">
            Ticket Subject
          </p>

          <p className="mt-2 font-semibold text-slate-800">
            {ticket.subject}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">

            <span className="text-slate-500">
              Current assignment:
            </span>

            <span className="font-medium text-slate-700">
              {currentAgentName}
            </span>

          </div>

        </div>

        {isReassignment && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">

            <AlertTriangle
              size={20}
              className="shrink-0"
            />

            <p>
              Reassigning this ticket will change its
              assigned support agent. Existing messages
              and ticket history should remain unchanged.
            </p>

          </div>
        )}

        <div className="relative">

          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            aria-label="Search available agents"
            value={search}
            disabled={submitting || loading}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search agents by name, email or ID..."
            className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
          />

        </div>

        <div className="flex items-center justify-between gap-3">

          <h3 className="text-sm font-semibold text-slate-700">
            Available Support Agents
          </h3>

          <button
            type="button"
            disabled={loading || submitting}
            onClick={() => {
              setSubmitError("");
              setRetryKey((previous) => previous + 1);
            }}
            className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

        </div>

        {!workloadAvailable && !loading && !loadError && (
          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            Agent workload is currently unavailable.
            Assignment is still possible.
          </div>
        )}

        {loading ? (

          <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500">

            <LoaderCircle
              size={24}
              className="animate-spin text-blue-600"
            />

            Loading available agents...

          </div>

        ) : loadError ? (

          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >

            <div className="flex items-center gap-2">

              <AlertCircle size={18} />

              {loadError}

            </div>

            <button
              type="button"
              onClick={() =>
                setRetryKey((previous) => previous + 1)
              }
              className="mt-3 font-medium underline"
            >
              Try Again
            </button>

          </div>

        ) : filteredAgents.length === 0 ? (

          <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 p-5 text-center">

            <UserRound
              size={35}
              className="mb-3 text-slate-300"
            />

            <p className="font-medium text-slate-700">
              {search.trim()
                ? "No matching agents"
                : "No eligible agents available"}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Only active support agents with configured
              passwords are eligible.
            </p>

          </div>

        ) : (

          <fieldset
            disabled={submitting}
            className="max-h-80 space-y-3 overflow-y-auto"
          >

            <legend className="sr-only">
              Select a support agent
            </legend>

            {filteredAgents.map((agent) => {
              const isCurrent =
                agent.id === ticket.assigned_agent_id;

              const isSelected =
                agent.id === selectedAgentId;

              return (
                <label
                  key={agent.id}
                  className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${
                    isCurrent
                      ? "cursor-not-allowed border-slate-200 bg-slate-100"
                      : isSelected
                        ? "cursor-pointer border-blue-500 bg-blue-50"
                        : "cursor-pointer border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >

                  <input
                    type="radio"
                    name="assignedAgent"
                    value={agent.id}
                    checked={isSelected}
                    disabled={isCurrent || submitting}
                    onChange={() => {
                      setSelectedAgentId(agent.id);
                      setSubmitError("");
                    }}
                    className="h-4 w-4 shrink-0 accent-blue-600"
                  />

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">

                    {getInitials(agent.name)}

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-semibold text-slate-800">
                      {agent.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {agent.email}
                    </p>

                    <p className="mt-1 text-xs font-medium text-green-600">
                      {isCurrent
                        ? "Currently Assigned"
                        : "Active Account"}
                    </p>

                  </div>

                  <div className="shrink-0 text-right">

                    <p className="text-lg font-bold text-slate-800">
                      {agent.activeTickets ?? "N/A"}
                    </p>

                    <p className="text-xs text-slate-500">
                      Active tickets
                    </p>

                  </div>

                </label>
              );
            })}

          </fieldset>

        )}

        {selectedAgent && !loading && !loadError && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">

            <p className="font-medium">
              Assignment Confirmation
            </p>

            <p className="mt-2">
              {isReassignment
                ? `This ticket will be reassigned from ${currentAgentName} to ${selectedAgent.name}.`
                : `${selectedAgent.name} will be assigned to this ticket.`}
            </p>

          </div>
        )}

        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >

            <AlertCircle
              size={20}
              className="shrink-0"
            />

            <span>{submitError}</span>

          </div>
        )}

      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-5">

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
          onClick={handleAssign}
          disabled={
            !selectedAgent ||
            loading ||
            submitting ||
            Boolean(loadError) ||
            selectedAgent.id === ticket.assigned_agent_id
          }
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >

          {submitting ? (
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
          ) : (
            <UserCheck size={18} />
          )}

          {submitting
            ? "Saving Assignment..."
            : actionLabel}

        </button>

      </div>

    </dialog>
  );
};

export default AgentAssignmentModal;