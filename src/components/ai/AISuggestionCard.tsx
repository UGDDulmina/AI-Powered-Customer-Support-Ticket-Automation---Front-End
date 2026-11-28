import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Send,
  LoaderCircle,
  AlertCircle,
  Bot,
  Pencil,
  Clock,
} from "lucide-react";

import {
  getAISuggestions,
  generateAISuggestion,
  reviewAISuggestion,
  sendAISuggestion,
  type AISuggestion,
} from "../../api/ai.api";

import { getApiErrorMessage } from "../../utils/apiError";

interface Props {
  ticketId: number;
  agentId: number;
  onReplySent?: () => void | Promise<void>;
  disabled?: boolean;
}

const MAX_LENGTH = 5000;

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  sent: "bg-blue-100 text-blue-700",
};

function formatStatus(status: string): string {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString();
}

export default function AISuggestionCard({
  ticketId,
  agentId,
  onReplySent,
  disabled = false,
}: Props) {
  const [suggestions, setSuggestions] = useState<
    AISuggestion[]
  >([]);

  const [edits, setEdits] = useState<
    Record<number, string>
  >({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [busyId, setBusyId] = useState<number | null>(null);

  const [busyAction, setBusyAction] = useState<
    "approve" | "reject" | "send" | null
  >(null);

  const [confirmSendId, setConfirmSendId] = useState<
    number | null
  >(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const actionLock = useRef(false);

  const controllerRef = useRef<AbortController | null>(
    null
  );

  const busy =
    disabled ||
    loading ||
    refreshing ||
    generating ||
    busyId !== null;

  const loadSuggestions = useCallback(
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

      try {
        const data = await getAISuggestions(
          ticketId,
          controller.signal
        );

        if (controller.signal.aborted) return;

        if (
          data.some(
            (suggestion) =>
              suggestion.ticket_id !== ticketId
          )
        ) {
          throw new Error(
            "Received suggestions for an invalid ticket."
          );
        }

        setSuggestions((previous) => {
          const merged = new Map<number, AISuggestion>();

          for (const item of previous) {
            if (item.status !== "pending") {
              merged.set(item.id, item);
            }
          }

          for (const item of data) {
            merged.set(item.id, {
              ...merged.get(item.id),
              ...item,
            });
          }

          return [...merged.values()].sort(
            (a, b) => b.id - a.id
          );
        });

        setEdits((previous) => {
          const next = { ...previous };

          for (const item of data) {
            if (
              next[item.id] === undefined ||
              item.status !== "pending"
            ) {
              next[item.id] =
                item.edited_reply ??
                item.suggested_reply;
            }
          }

          return next;
        });
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setError(getApiErrorMessage(err));
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
    void loadSuggestions();

    return () => {
      controllerRef.current?.abort();
    };
  }, [loadSuggestions]);

  useEffect(() => {
    if (!success) return;

    const timeout = window.setTimeout(() => {
      setSuccess("");
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [success]);

  async function handleGenerate() {
    if (busy || actionLock.current) return;

    actionLock.current = true;

    setGenerating(true);
    setError("");
    setSuccess("");
    setConfirmSendId(null);

    try {
      await generateAISuggestion(ticketId);

      setSuccess(
        "AI reply suggestion generated successfully."
      );

      await loadSuggestions(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      actionLock.current = false;
      setGenerating(false);
    }
  }

  async function handleReview(
    suggestion: AISuggestion,
    action: "approve" | "reject"
  ) {
    if (
      busy ||
      actionLock.current ||
      suggestion.status !== "pending"
    ) {
      return;
    }

    const editedReply = (
      edits[suggestion.id] ??
      suggestion.edited_reply ??
      suggestion.suggested_reply
    ).trim();

    if (
      action === "approve" &&
      (!editedReply || editedReply.length > MAX_LENGTH)
    ) {
      setError(
        "Enter a valid reply before approving the suggestion."
      );

      return;
    }

    actionLock.current = true;

    setBusyId(suggestion.id);
    setBusyAction(action);
    setError("");
    setSuccess("");
    setConfirmSendId(null);

    try {
      const updated = await reviewAISuggestion(
        suggestion.id,
        agentId,
        action,
        action === "approve"
          ? editedReply
          : undefined
      );

      setSuggestions((previous) =>
        previous.map((item) =>
          item.id === suggestion.id
            ? { ...item, ...updated }
            : item
        )
      );

      setEdits((previous) => ({
        ...previous,
        [suggestion.id]:
          updated.edited_reply ??
          updated.suggested_reply,
      }));

      setSuccess(
        action === "approve"
          ? "AI reply approved successfully."
          : "AI suggestion rejected successfully."
      );
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      actionLock.current = false;
      setBusyId(null);
      setBusyAction(null);
    }
  }

  async function handleSend(suggestion: AISuggestion) {
    if (
      busy ||
      actionLock.current ||
      suggestion.status !== "approved" ||
      confirmSendId !== suggestion.id
    ) {
      return;
    }

    if (
      suggestion.reviewed_by_agent_id != null &&
      suggestion.reviewed_by_agent_id !== agentId
    ) {
      setError(
        "This suggestion was approved by another agent."
      );

      return;
    }

    actionLock.current = true;

    setBusyId(suggestion.id);
    setBusyAction("send");
    setError("");
    setSuccess("");

    try {
      await sendAISuggestion(suggestion.id, agentId);

      setSuggestions((previous) =>
        previous.map((item) =>
          item.id === suggestion.id
            ? { ...item, status: "sent" }
            : item
        )
      );

      setConfirmSendId(null);

      setSuccess(
        "AI-assisted reply sent successfully."
      );

      try {
        await onReplySent?.();
      } catch {
        setError(
          "The reply was sent, but the conversation could not be refreshed."
        );
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      actionLock.current = false;
      setBusyId(null);
      setBusyAction(null);
    }
  }

  const pendingCount = suggestions.filter(
    (item) => item.status === "pending"
  ).length;

  const approvedCount = suggestions.filter(
    (item) => item.status === "approved"
  ).length;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-violet-100 p-3">
            <Sparkles
              size={24}
              className="text-violet-600"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              AI Reply Assistant
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Generate, review and send AI-assisted
              customer replies.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void loadSuggestions(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => void handleGenerate()}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {generating ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <Sparkles size={17} />
            )}

            {generating
              ? "Generating..."
              : "Generate AI Reply"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-700">
            Pending Review
          </p>

          <p className="mt-1 text-2xl font-bold text-amber-800">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-xs font-medium text-green-700">
            Approved Replies
          </p>

          <p className="mt-1 text-2xl font-bold text-green-800">
            {approvedCount}
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-5 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-40 flex-col items-center justify-center">
          <LoaderCircle className="h-7 w-7 animate-spin text-violet-600" />

          <p className="mt-3 text-sm text-gray-500">
            Loading AI suggestions...
          </p>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <Bot className="mx-auto h-12 w-12 text-gray-400" />

          <h3 className="mt-3 font-semibold text-gray-900">
            No AI suggestions available
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Generate a reply based on the ticket details.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {suggestions.map((suggestion) => {
            const editedReply =
              edits[suggestion.id] ??
              suggestion.edited_reply ??
              suggestion.suggested_reply;

            const pending =
              suggestion.status === "pending";

            const approved =
              suggestion.status === "approved";

            const sent =
              suggestion.status === "sent";

            const rejected =
              suggestion.status === "rejected";

            const isBusy =
              busyId === suggestion.id;

            const reviewedByAnotherAgent =
              suggestion.reviewed_by_agent_id != null &&
              suggestion.reviewed_by_agent_id !== agentId;

            const validReply =
              Boolean(editedReply.trim()) &&
              editedReply.length <= MAX_LENGTH;

            return (
              <article
                key={suggestion.id}
                className="rounded-xl border border-gray-200 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Bot
                      size={19}
                      className="text-violet-600"
                    />

                    <h3 className="font-semibold text-gray-900">
                      Suggestion #{suggestion.id}
                    </h3>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      statusStyles[suggestion.status] ??
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {formatStatus(suggestion.status)}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={14} />

                  {formatDate(suggestion.created_at)}
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Original AI Suggestion
                  </p>

                  <div className="whitespace-pre-wrap break-words rounded-lg bg-violet-50 p-4 text-sm leading-relaxed text-gray-700">
                    {suggestion.suggested_reply}
                  </div>
                </div>

                {pending && (
                  <div className="mt-5">
                    <label
                      htmlFor={`suggestion-${suggestion.id}`}
                      className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
                    >
                      <Pencil size={15} />
                      Edit Reply
                    </label>

                    <textarea
                      id={`suggestion-${suggestion.id}`}
                      value={editedReply}
                      maxLength={MAX_LENGTH}
                      rows={6}
                      disabled={busy}
                      onChange={(event) => {
                        setEdits((previous) => ({
                          ...previous,
                          [suggestion.id]:
                            event.target.value,
                        }));
                      }}
                      className="w-full resize-y rounded-lg border border-gray-300 p-4 text-sm leading-relaxed outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-gray-100"
                    />

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          setEdits((previous) => ({
                            ...previous,
                            [suggestion.id]:
                              suggestion.suggested_reply,
                          }))
                        }
                        className="text-xs font-medium text-violet-600 hover:underline disabled:opacity-50"
                      >
                        Reset to Original
                      </button>

                      <span
                        className={`text-xs ${
                          editedReply.length >= MAX_LENGTH
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {editedReply.length} / {MAX_LENGTH}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void handleReview(
                            suggestion,
                            "reject"
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {isBusy &&
                        busyAction === "reject" ? (
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <XCircle size={16} />
                        )}

                        Reject
                      </button>

                      <button
                        type="button"
                        disabled={busy || !validReply}
                        onClick={() =>
                          void handleReview(
                            suggestion,
                            "approve"
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {isBusy &&
                        busyAction === "approve" ? (
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}

                        Approve Reply
                      </button>
                    </div>
                  </div>
                )}

                {(approved || sent) && (
                  <div className="mt-5">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Final Approved Reply
                    </p>

                    <div className="whitespace-pre-wrap break-words rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-relaxed text-gray-700">
                      {suggestion.edited_reply ??
                        suggestion.suggested_reply}
                    </div>

                    {suggestion.reviewed_at && (
                      <p className="mt-2 text-xs text-gray-500">
                        Reviewed:{" "}
                        {formatDate(
                          suggestion.reviewed_at
                        )}
                      </p>
                    )}
                  </div>
                )}

                {approved &&
                  reviewedByAnotherAgent && (
                    <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                      This reply was approved by another
                      agent.
                    </div>
                  )}

                {approved &&
                  !reviewedByAnotherAgent && (
                    <div className="mt-5">
                      {confirmSendId === suggestion.id ? (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                          <p className="font-medium text-blue-900">
                            Confirm Sending Reply
                          </p>

                          <p className="mt-2 text-sm text-blue-700">
                            This approved reply will be
                            added to the customer
                            conversation.
                          </p>

                          <div className="mt-4 flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                setConfirmSendId(null)
                              }
                              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 disabled:opacity-50"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void handleSend(suggestion)
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                            >
                              {isBusy &&
                              busyAction === "send" ? (
                                <LoaderCircle
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Send size={16} />
                              )}

                              {isBusy &&
                              busyAction === "send"
                                ? "Sending..."
                                : "Confirm Send"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              setConfirmSendId(
                                suggestion.id
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            <Send size={16} />
                            Send Approved Reply
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                {sent && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                    <CheckCircle2 size={17} />
                    Reply sent to the conversation.
                  </div>
                )}

                {rejected && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <XCircle size={17} />
                    This suggestion was rejected.
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}