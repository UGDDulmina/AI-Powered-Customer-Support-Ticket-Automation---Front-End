
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import {
  getAISuggestions,
  generateAISuggestion,
  reviewAISuggestion,
  sendAISuggestion,
  type AISuggestion,
} from "../../api/ai.api";

interface Props {
  ticketId: number;
  agentId: number;
  onReplySent?: () => void | Promise<void>;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default function AISuggestionCard({
  ticketId,
  agentId,
  onReplySent,
}: Props) {
  const [suggestions, setSuggestions] = useState<
    AISuggestion[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [edits, setEdits] = useState<
    Record<number, string>
  >({});

  const loadSuggestions = useCallback(async () => {
    try {
      setError("");

      const data = await getAISuggestions(ticketId);
      setSuggestions(data);

      setEdits((previous) => {
        const next = { ...previous };

        for (const item of data) {
          if (next[item.id] === undefined) {
            next[item.id] =
              item.edited_reply ?? item.suggested_reply;
          }
        }

        return next;
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [ticketId]);

  useEffect(() => {
    void loadSuggestions();
  }, [loadSuggestions]);

  async function handleGenerate() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      await generateAISuggestion(ticketId);
      await loadSuggestions();

      setMessage("AI suggestion generated successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(
    suggestion: AISuggestion,
    action: "approve" | "reject"
  ) {
    const editedText =
      edits[suggestion.id] ?? suggestion.suggested_reply;

    if (action === "approve" && !editedText.trim()) {
      setError("Reply cannot be empty.");
      return;
    }

    try {
      setBusyId(suggestion.id);
      setError("");
      setMessage("");

      await reviewAISuggestion(
        suggestion.id,
        agentId,
        action,
        action === "approve"
          ? editedText.trim()
          : undefined
      );

      await loadSuggestions();

      setMessage(
        action === "approve"
          ? "Suggestion approved. You can now send it."
          : "Suggestion rejected."
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleSend(suggestionId: number) {
    try {
      setBusyId(suggestionId);
      setError("");
      setMessage("");

      await sendAISuggestion(suggestionId, agentId);
      await loadSuggestions();

      await onReplySent?.();

      setMessage("AI reply sent successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-xl border bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          AI Reply Assistant
        </h2>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || busyId !== null}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate AI Reply"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="mb-3 text-sm text-green-700">
          {message}
        </p>
      )}

      {suggestions.length === 0 && (
        <p className="text-sm text-gray-500">
          No AI suggestions available for this ticket.
        </p>
      )}

      <div className="space-y-4">
        {suggestions.map((suggestion) => {
          const pending = suggestion.status === "pending";
          const approved = suggestion.status === "approved";
          const busy = busyId === suggestion.id;

          return (
            <div
              key={suggestion.id}
              className="rounded-lg border p-4"
            >
              <div className="mb-3 flex justify-between">
                <span className="text-sm font-medium">
                  Suggestion #{suggestion.id}
                </span>

                <span className="text-sm capitalize text-gray-500">
                  {suggestion.status}
                </span>
              </div>

              <textarea
                rows={5}
                value={
                  edits[suggestion.id] ??
                  suggestion.suggested_reply
                }
                onChange={(event) =>
                  setEdits((previous) => ({
                    ...previous,
                    [suggestion.id]: event.target.value,
                  }))
                }
                disabled={!pending || busy}
                className="w-full rounded-lg border p-3 text-sm disabled:bg-gray-50"
              />

              {pending && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={busy || busyId !== null}
                    onClick={() =>
                      void handleReview(suggestion, "approve")
                    }
                    className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    disabled={busy || busyId !== null}
                    onClick={() =>
                      void handleReview(suggestion, "reject")
                    }
                    className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}

              {approved && (
                <button
                  type="button"
                  disabled={busy || busyId !== null}
                  onClick={() =>
                    void handleSend(suggestion.id)
                  }
                  className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  {busy ? "Sending..." : "Send Approved Reply"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
