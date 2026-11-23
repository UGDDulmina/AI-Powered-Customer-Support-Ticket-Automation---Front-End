
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

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

import AISuggestionCard from "../../components/ai/AISuggestionCard";

import ReplyComposer from "./ReplyComposer";
import { getCurrentAgent } from "../../api/auth.api";
import AutomationJobsPanel from "../automation/AutomationJobsPanel";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401) {
      return "Your session has expired. Please log in again.";
    }

    if (status === 403) {
      return "You do not have permission to access this resource.";
    }

    if (status === 404) {
      return "The requested resource was not found. Check the backend endpoint.";
    }

    if (status === 422) {
      return "The backend rejected the request format.";
    }

    return `Request failed${status ? ` (${status})` : ""}.`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
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

  if (sender === "agent" || sender === "support_agent") {
    senderType = "agent";
  } else if (sender === "customer") {
    senderType = "customer";
  }

  return {
    id: message.id,
    content:
      message.content ??
      message.message ??
      message.body ??
      "",
    senderType,
    senderLabel:
      senderType === "agent"
        ? "Support Agent"
        : senderType === "customer"
          ? "Customer"
          : "Unknown Sender",
    createdAt: message.created_at,
  };
}

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();

  const id = Number(ticketId);

  const validId =
    Number.isInteger(id) && id > 0;

  const [ticket, setTicket] = useState<Ticket | null>(
    null
  );

  const [messages, setMessages] = useState<
    SupportMessage[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("");

  const [savingStatus, setSavingStatus] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

    
 const [agentId, setAgentId] = useState<number | null>(null);

 useEffect(() => {
    async function loadAgent() {
        try {
        const agent = await getCurrentAgent();
        setAgentId(agent.id);
        } catch (err) {
        setError(getErrorMessage(err));
        }
    }

    void loadAgent();
    }, []);

  const loadTicket = useCallback(async () => {
    if (!validId) {
      setError("Invalid ticket ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setMessageError("");

    try {
      const ticketData = await getTicketById(id);

      setTicket(ticketData);
      setSelectedStatus(ticketData.status ?? "");

      try {
        const messageData = await getTicketMessages(id);
        setMessages(messageData);
      } catch (messageErr) {
        setMessages([]);
        setMessageError(
          `Unable to load conversation: ${
            getErrorMessage(messageErr)
          }`
        );
      }
    } catch (err) {
      setTicket(null);
      setMessages([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id, validId]);

  useEffect(() => {
    void loadTicket();
  }, [loadTicket]);

  const conversationMessages = useMemo(
    () =>
      [...messages]
        .sort((a, b) => {
          const first = a.created_at
            ? Date.parse(a.created_at)
            : 0;

          const second = b.created_at
            ? Date.parse(b.created_at)
            : 0;

          return first - second;
        })
        .map(mapMessage),
    [messages]
  );

  async function handleManualReply(
    content: string
  ) {
    if (!validId) {
      throw new Error("Invalid ticket ID");
    }

    setError("");
    setSuccess("");

    try {
      await createManualReply(id, content);

      const updatedMessages =
        await getTicketMessages(id);

      setMessages(updatedMessages);
      setMessageError("");
      setSuccess("Reply saved successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  }

  async function handleStatusUpdate() {
    if (!ticket || !selectedStatus) {
      return;
    }

    setSavingStatus(true);
    setError("");
    setSuccess("");

    try {
      const updatedTicket =
        await updateTicketStatus(
          ticket.id,
          selectedStatus
        );

      setTicket(updatedTicket);
      setSelectedStatus(
        updatedTicket.status ?? selectedStatus
      );

      setSuccess("Ticket status updated.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    setSuccess("");

    try {
      await loadTicket();
    } finally {
      setRefreshing(false);
    }
  }

  if (!validId) {
    return (
      <div className="p-8 text-red-600">
        Invalid ticket ID.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        Loading ticket details...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/tickets"
            className="text-blue-600"
          >
            Back to Ticket Inbox
          </Link>

          <p className="mt-6 text-red-600">
            {error || "Ticket not found."}
          </p>

          <button
            onClick={() => void loadTicket()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const ticketTitle =
    ticket.subject ??
    ticket.title ??
    "Untitled Ticket";


  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">


        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/tickets"
            className="font-medium text-blue-600 hover:underline"
          >
            Back to Ticket Inbox
          </Link>

          <button
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className="rounded-lg border bg-white px-4 py-2 hover:bg-slate-50 disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Ticket #{ticket.id}
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                {ticketTitle}
              </h1>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium capitalize text-blue-700">
              {ticket.status ?? "Unknown"}
            </span>
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-slate-500">Customer ID</p>
              <p className="font-medium">
                {ticket.customer_id ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Assigned Agent</p>
              <p className="font-medium">
                {ticket.assigned_agent_id ?? "Unassigned"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Priority</p>
              <p className="font-medium capitalize">
                {ticket.priority ?? "Not set"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Created</p>
              <p className="font-medium">
                {ticket.created_at
                  ? new Date(
                      ticket.created_at
                    ).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>

          {ticket.description && (
            <div className="mt-6 border-t pt-5">
              <h2 className="mb-2 font-semibold">
                Description
              </h2>

              <p className="whitespace-pre-wrap text-slate-700">
                {ticket.description}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            Update Ticket Status
          </h2>

          <div className="flex flex-wrap gap-3">
            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value)
              }
              className="min-w-48 rounded-lg border border-slate-300 px-4 py-2"
            >
              {Array.from(
                new Set(
                  [
                    ticket.status,
                    "open",
                    "in_progress",
                    "pending",
                    "resolved",
                    "closed",
                  ].filter(
                    (status): status is string =>
                      Boolean(status)
                  )
                )
              ).map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                void handleStatusUpdate()
              }
              disabled={
                savingStatus ||
                !selectedStatus ||
                selectedStatus === ticket.status
              }
              className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
            >
              {savingStatus
                ? "Updating..."
                : "Update Status"}
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Available status values must match your backend's
            accepted values.
          </p>
        </div>


        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">
            Customer Conversation
          </h2>

          {messageError && (
            <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              {messageError}
            </div>
          )}

          <Conversation
            messages={conversationMessages}
          />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <ReplyComposer
            onSend={handleManualReply}
            disabled={Boolean(messageError)}
          />

          <p className="mt-3 text-xs text-slate-500">
            Saving a reply records it in the backend.
            External message delivery is a separate
            capability.
          </p>
        </div>
            {agentId !== null && (
            <AISuggestionCard
                ticketId={id}
                agentId={agentId}
                onReplySent={async () => {
                const updatedMessages = await getTicketMessages(id);
                setMessages(updatedMessages);
                setMessageError("");
                }}
            />
            )}
             <AutomationJobsPanel ticketId={id} />
      </div>
    </div>
  );
}
