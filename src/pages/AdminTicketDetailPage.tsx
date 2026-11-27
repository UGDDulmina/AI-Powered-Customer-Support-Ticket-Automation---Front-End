import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  X,
} from "lucide-react";

import {
  getTicketAssignmentDetails,
} from "../api/ticketAssignment.api";

import {
  getAgents,
} from "../api/agents.api";

import type {
  AdminTicket,
  TicketStatus,
} from "../types/adminTicket.types";

import type {
  Agent,
} from "../types/agent.types";

import type {
  AssignableAgent,
} from "../types/ticketAssignment.types";

import TicketAssignmentCard from
  "../components/admin/tickets/TicketAssignmentCard";

import AgentAssignmentModal from
  "../components/admin/tickets/AgentAssignmentModal";

import TicketManagementCard from
  "../components/admin/tickets/TicketManagementCard";

import TicketEditModal from
  "../components/admin/tickets/TicketEditModal";

import TicketPriorityModal from
  "../components/admin/tickets/TicketPriorityModal";

import TicketStatusModal from
  "../components/admin/tickets/TicketStatusModal";

import TicketActivityTimeline from
  "../components/admin/tickets/TicketActivityTimeline";

import TicketDetailPage from
  "../components/tickets/TicketDetailPage";

import {
  getApiErrorMessage,
} from "../utils/apiError";

type TicketModal =
  | { type: "assignment" }
  | { type: "edit" }
  | { type: "priority" }
  | {
      type: "status";
      initialStatus?: TicketStatus;
    }
  | null;

interface AdminTicketDetailContentProps {
  ticketId: number;
}

const AdminTicketDetailContent = ({
  ticketId,
}: AdminTicketDetailContentProps) => {
  const [ticket, setTicket] =
    useState<AdminTicket | null>(null);

  const [agents, setAgents] =
    useState<Agent[]>([]);

  const [agentLookupAvailable, setAgentLookupAvailable] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [agentError, setAgentError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [modal, setModal] = useState<TicketModal>(null);
  const [detailVersion, setDetailVersion] = useState(0);
  const [openingModal, setOpeningModal] = useState(false);

  const controllerRef =
    useRef<AbortController | null>(null);

  const modalControllerRef =
    useRef<AbortController | null>(null);

  const openingModalRef = useRef(false);

  const loadTicket = useCallback(
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
      setAgentError("");

      try {
        const [ticketResult, agentResult] =
          await Promise.allSettled([
            getTicketAssignmentDetails(
              ticketId,
              controller.signal
            ),
            getAgents(undefined, controller.signal),
          ]);

        if (controller.signal.aborted) {
          return;
        }

        if (ticketResult.status === "fulfilled") {
          setTicket(ticketResult.value);
        } else {
          setError(
            getApiErrorMessage(ticketResult.reason)
          );
        }

        if (agentResult.status === "fulfilled") {
          setAgents(agentResult.value);
          setAgentLookupAvailable(true);
        } else {
          setAgentLookupAvailable(false);

          setAgentError(
            getApiErrorMessage(agentResult.reason)
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [ticketId]
  );

  useEffect(() => {
    void loadTicket();

    return () => {
      controllerRef.current?.abort();
      modalControllerRef.current?.abort();
    };
  }, [loadTicket]);

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

  const assignedAgent = agents.find(
    (agent) => agent.id === ticket?.assigned_agent_id
  );

  const currentAgentName =
    assignedAgent?.name ||
    ticket?.assigned_agent_name ||
    (
      ticket?.assigned_agent_id != null
        ? `Agent #${ticket.assigned_agent_id}`
        : "Unassigned"
    );

  const handleOpenModal = async (
    nextModal: NonNullable<TicketModal>
  ) => {
    if (
      loading ||
      refreshing ||
      modal ||
      openingModalRef.current
    ) {
      return;
    }

    openingModalRef.current = true;
    setOpeningModal(true);
    setSuccessMessage("");
    setError("");

    const controller = new AbortController();
    modalControllerRef.current = controller;

    try {
      const latestTicket =
        await getTicketAssignmentDetails(
          ticketId,
          controller.signal
        );

      if (controller.signal.aborted) {
        return;
      }

      setTicket(latestTicket);

      if (
        nextModal.type === "assignment" &&
        latestTicket.status === "closed"
      ) {
        setError(
          "Closed tickets cannot be assigned. Reopen the ticket first."
        );

        return;
      }

      setModal(nextModal);
    } catch (error: unknown) {
      if (!controller.signal.aborted) {
        setError(getApiErrorMessage(error));
      }
    } finally {
      if (!controller.signal.aborted) {
        openingModalRef.current = false;
        setOpeningModal(false);
      }
    }
  };

  const handleCloseModal = () => {
    setModal(null);
  };

  const handleMutationSuccess = (
    message: string
  ) => {
    setModal(null);
    setSuccessMessage(message);

    setDetailVersion((previous) => previous + 1);

    void loadTicket(true);
  };

  const handleAssignmentSuccess = (
    agent: AssignableAgent
  ) => {
    handleMutationSuccess(
      `Ticket assignment updated successfully for ${agent.name}.`
    );
  };

  const handleRefresh = () => {
    if (
      loading ||
      refreshing ||
      modal ||
      openingModalRef.current
    ) {
      return;
    }

    setDetailVersion((previous) => previous + 1);

    void loadTicket(true);
  };

  if (loading && !ticket) {
    return (
      <div className="flex min-h-80 items-center justify-center gap-3 text-sm text-slate-500">
        <LoaderCircle
          size={28}
          className="animate-spin text-blue-600"
        />

        Loading ticket details...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-5">
        <Link
          to="/admin/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Tickets
        </Link>

        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-white p-8 text-center"
        >
          <AlertCircle
            size={42}
            className="mx-auto mb-4 text-red-500"
          />

          <h2 className="font-semibold text-slate-800">
            Unable to load ticket
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error || "Ticket information is unavailable."}
          </p>

          <button
            type="button"
            onClick={() => void loadTicket()}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const actionsDisabled =
    loading ||
    refreshing ||
    openingModal ||
    Boolean(error) ||
    modal !== null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/admin/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Tickets
        </Link>

        <button
          type="button"
          disabled={
            refreshing ||
            loading ||
            openingModal ||
            modal !== null
          }
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <CheckCircle2
            size={21}
            className="shrink-0"
          />

          <span className="flex-1">
            {successMessage}
          </span>

          <button
            type="button"
            aria-label="Dismiss success message"
            onClick={() => setSuccessMessage("")}
            className="text-green-600 hover:text-green-800"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle
            size={20}
            className="shrink-0"
          />

          <p>
            {error}
            {" "}
            Refresh the ticket before making further changes.
          </p>
        </div>
      )}

      {agentError && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          Unable to load agent information: {agentError}
        </div>
      )}

      {openingModal && (
        <div
          role="status"
          className="flex items-center gap-2 text-sm text-slate-500"
        >
          <LoaderCircle
            size={18}
            className="animate-spin text-blue-600"
          />

          Retrieving latest ticket information...
        </div>
      )}

      <TicketManagementCard
        ticket={ticket}
        disabled={actionsDisabled}
        onEdit={() =>
          void handleOpenModal({ type: "edit" })
        }
        onChangePriority={() =>
          void handleOpenModal({ type: "priority" })
        }
        onChangeStatus={(status) =>
          void handleOpenModal(
            status
              ? {
                  type: "status",
                  initialStatus: status,
                }
              : { type: "status" }
          )
        }
      />

      <TicketAssignmentCard
        ticket={ticket}
        agentLookupAvailable={agentLookupAvailable}
        {...(assignedAgent
          ? { agent: assignedAgent }
          : {})}
        disabled={actionsDisabled}
        onAssign={() =>
          void handleOpenModal({ type: "assignment" })
        }
      />

      <TicketDetailPage
        key={`${ticketId}-${detailVersion}`}
      />

      <TicketActivityTimeline
        ticketId={ticketId}
        refreshKey={detailVersion}
      />

      {modal?.type === "assignment" && (
        <AgentAssignmentModal
          ticket={ticket}
          currentAgentName={currentAgentName}
          onClose={handleCloseModal}
          onSuccess={handleAssignmentSuccess}
        />
      )}

      {modal?.type === "edit" && (
        <TicketEditModal
          ticket={ticket}
          onClose={handleCloseModal}
          onSuccess={() =>
            handleMutationSuccess(
              "Ticket information updated successfully."
            )
          }
        />
      )}

      {modal?.type === "priority" && (
        <TicketPriorityModal
          ticket={ticket}
          onClose={handleCloseModal}
          onSuccess={() =>
            handleMutationSuccess(
              "Ticket priority updated successfully."
            )
          }
        />
      )}

      {modal?.type === "status" && (
        <TicketStatusModal
          ticket={ticket}
          {...(modal.initialStatus
            ? { initialStatus: modal.initialStatus }
            : {})}
          onClose={handleCloseModal}
          onSuccess={() =>
            handleMutationSuccess(
              "Ticket status updated successfully."
            )
          }
        />
      )}
    </div>
  );
};

const AdminTicketDetailPage = () => {
  const { ticketId } = useParams();

  const numericTicketId = Number(ticketId);

  if (
    !Number.isSafeInteger(numericTicketId) ||
    numericTicketId <= 0
  ) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Tickets
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Invalid ticket ID.
        </div>
      </div>
    );
  }

  return (
    <AdminTicketDetailContent
      key={numericTicketId}
      ticketId={numericTicketId}
    />
  );
};

export default AdminTicketDetailPage;