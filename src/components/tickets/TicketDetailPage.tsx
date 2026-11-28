import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useParams } from "react-router-dom";

import {
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

import {
  getTicketById,
  updateTicketStatus,
  type Ticket,
} from "../../api/tickets.api";

import {
  getTicketMessages,
  createManualReply,
  type SupportMessage,
} from "../../api/messages.api";

import Conversation, {
  type ConversationMessage,
} from "./Conversation";

import AISuggestionCard from "../ai/AISuggestionCard";
import ReplyComposer from "./ReplyComposer";
import AutomationJobsPanel from "../automation/AutomationJobsPanel";
import { useAuth } from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../utils/apiError";

const TICKET_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];

function formatLabel(value?: string | null): string {
  if (!value) return "Not set";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null): string {
  if (!value) return "Not available";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString();
}

function mapMessage(
  message: SupportMessage
): ConversationMessage {
  const sender = (
    message.sender_type ??
    message.sender_role ??
    ""
  ).toLowerCase();

  let senderType: ConversationMessage["senderType"] =
    "system";

  let senderLabel = "System";

  if (sender === "customer") {
    senderType = "customer";
    senderLabel = "Customer";
  } else if (
    sender === "agent" ||
    sender === "support_agent"
  ) {
    senderType = "agent";
    senderLabel = "Support Agent";
  } else if (sender === "ai") {
    senderType = "agent";
    senderLabel = "AI-Assisted Reply";
  }

  return {
    id: message.id,
    content:
      message.content ??
      message.message ??
      message.body ??
      "",
    senderType,
    senderLabel,
    createdAt: message.created_at,
  };
}

interface ContentProps {
  ticketId: number;
  agentId: number;
  isAdmin: boolean;
}

function TicketDetailContent({
  ticketId,
  agentId,
  isAdmin,
}: ContentProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const [messages, setMessages] = useState<SupportMessage[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [error, setError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [success, setSuccess] = useState("");

  const statusBusyRef = useRef(false);
  const replyBusyRef = useRef(false);
  const requestVersion = useRef(0);

  const loadMessages = useCallback(async () => {
    try {
      const data = await getTicketMessages(ticketId);

      setMessages(data);
      setMessageError("");
    } catch (err: unknown) {
      setMessageError(getApiErrorMessage(err));
    }
  }, [ticketId]);

  const loadTicket = useCallback(
    async (isRefresh = false) => {
      const version = ++requestVersion.current;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const data = await getTicketById(ticketId);

        if (version !== requestVersion.current) return;

        if (!isAdmin && data.assigned_agent_id !== agentId) {
          setTicket(null);
          setMessages([]);
          setError("You do not have access to this ticket.");
          return;
        }

        setTicket(data);
        setSelectedStatus(data.status ?? "");

        try {
          const messageData = await getTicketMessages(ticketId);

          if (version !== requestVersion.current) return;

          setMessages(messageData);
          setMessageError("");
        } catch (err: unknown) {
          if (version !== requestVersion.current) return;

          setMessageError(getApiErrorMessage(err));
        }
      } catch (err: unknown) {
        if (version !== requestVersion.current) return;

        setTicket(null);
        setMessages([]);
        setError(getApiErrorMessage(err));
      } finally {
        if (version === requestVersion.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [ticketId, agentId, isAdmin]
  );

  useEffect(() => {
    void loadTicket();

    return () => {
      requestVersion.current++;
    };
  }, [loadTicket]);

  useEffect(() => {
    if (!success) return;

    const timeout = window.setTimeout(() => {
      setSuccess("");
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [success]);

  const conversationMessages = useMemo(
    () =>
      [...messages]
        .sort((a, b) => {
          const first = Date.parse(a.created_at ?? "") || 0;
          const second = Date.parse(b.created_at ?? "") || 0;

          return first - second || a.id - b.id;
        })
        .map(mapMessage),
    [messages]
  );

  async function handleManualReply(content: string) {
    const reply = content.trim();

    if (!ticket || !reply || reply.length > 5000) {
      throw new Error("Enter a valid reply.");
    }

    if (replyBusyRef.current) {
      throw new Error("A reply is already being submitted.");
    }

    replyBusyRef.current = true;
    setSendingReply(true);
    setError("");
    setSuccess("");

    try {
      const createdMessage = await createManualReply(
        ticketId,
        reply
      );

      setMessages((previous) => [
        ...previous.filter(
          (message) => message.id !== createdMessage.id
        ),
        createdMessage,
      ]);

      setSuccess("Reply sent successfully.");

      await loadMessages();
    } finally {
      replyBusyRef.current = false;
      setSendingReply(false);
    }
  }

  async function handleStatusUpdate() {
    if (
      !ticket ||
      !TICKET_STATUSES.includes(selectedStatus) ||
      selectedStatus === ticket.status ||
      statusBusyRef.current
    ) {
      return;
    }

    statusBusyRef.current = true;
    setSavingStatus(true);
    setError("");
    setSuccess("");

    try {
      await updateTicketStatus(ticketId, selectedStatus);

      setTicket((previous) =>
        previous
          ? { ...previous, status: selectedStatus }
          : previous
      );

      setSuccess("Ticket status updated successfully.");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      statusBusyRef.current = false;
      setSavingStatus(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border bg-white">
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />

        <p className="mt-3 text-sm text-gray-500">
          Loading ticket details...
        </p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />

        <h2 className="mt-4 font-semibold text-gray-900">
          Unable to load ticket
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error || "Ticket not found."}
        </p>

        <button
          onClick={() => void loadTicket()}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  const busy =
    refreshing || savingStatus || sendingReply;

  const closed = ticket.status === "closed";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Ticket Details
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage customer conversations and replies.
          </p>
        </div>

        <button
          onClick={() => void loadTicket(true)}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              Ticket #{ticket.id}
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              {ticket.subject ??
                ticket.title ??
                "Untitled Ticket"}
            </h1>
          </div>

          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            {formatLabel(ticket.status)}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Customer ID", ticket.customer_id ?? "Not set"],
            [
              "Assigned Agent",
              ticket.assigned_agent_id ?? "Unassigned",
            ],
            ["Priority", formatLabel(ticket.priority)],
            ["Category", formatLabel(ticket.category)],
            ["Created", formatDate(ticket.created_at)],
            ["Updated", formatDate(ticket.updated_at)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg bg-gray-50 p-4"
            >
              <p className="text-xs font-medium text-gray-500">
                {label}
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {value}
              </p>
            </div>
          ))}
        </div>

        {ticket.description && (
          <div className="mt-6 border-t border-gray-200 pt-5">
            <h3 className="font-semibold text-gray-900">
              Description
            </h3>

            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
              {ticket.description}
            </p>
          </div>
        )}
      </section>

      {!isAdmin && (
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Update Ticket Status
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <select
              aria-label="Ticket status"
              value={selectedStatus}
              disabled={busy}
              onChange={(event) =>
                setSelectedStatus(event.target.value)
              }
              className="min-w-48 rounded-lg border border-gray-300 px-4 py-2 text-sm"
            >
              {TICKET_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>

            <button
              onClick={() => void handleStatusUpdate()}
              disabled={
                busy ||
                !selectedStatus ||
                selectedStatus === ticket.status
              }
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {savingStatus ? "Updating..." : "Update Status"}
            </button>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-600" />

            <h2 className="text-lg font-semibold text-gray-900">
              Customer Conversation
            </h2>
          </div>

          <span className="text-sm text-gray-500">
            {messages.length} messages
          </span>
        </div>

        {messageError && (
          <div className="mb-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            <p>{messageError}</p>

            <button
              onClick={() => void loadMessages()}
              disabled={busy}
              className="mt-2 font-medium underline"
            >
              Refresh Conversation
            </button>
          </div>
        )}

        <Conversation messages={conversationMessages} />
      </section>

      {closed ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
          This ticket is closed. Reopen it before sending
          additional replies.
        </div>
      ) : (
        <>
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <ReplyComposer
              onSend={handleManualReply}
              disabled={busy || Boolean(messageError)}
            />

            <p className="mt-3 text-xs text-gray-500">
              Replies are saved to the ticket conversation.
            </p>
          </section>

         <AISuggestionCard
            key={`${ticketId}-${agentId}`}
            ticketId={ticketId}
            agentId={agentId}
            onReplySent={loadMessages}
            disabled={busy || Boolean(messageError)}
          />
        </>
      )}

      {isAdmin && (
        <AutomationJobsPanel ticketId={ticketId} />
      )}
    </div>
  );
}

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();

  const { user, loading } = useAuth();

  const id = Number(ticketId);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!Number.isSafeInteger(id) || id <= 0) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        Invalid ticket ID.
      </div>
    );
  }

  if (!user || !user.is_active) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        You are not authorized to access this ticket.
      </div>
    );
  }

  return (
    <TicketDetailContent
      key={`${id}-${user.id}`}
      ticketId={id}
      agentId={user.id}
      isAdmin={user.role === "admin"}
    />
  );
}