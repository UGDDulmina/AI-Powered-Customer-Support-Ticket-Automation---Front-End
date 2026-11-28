import { useRef, useState } from "react";
import { Send, LoaderCircle, AlertCircle } from "lucide-react";
import { getApiErrorMessage } from "../../utils/apiError";

interface ReplyComposerProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

const MAX_LENGTH = 5000;

export default function ReplyComposer({
  onSend,
  disabled = false,
}: ReplyComposerProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submittingRef = useRef(false);

  const canSend =
    Boolean(message.trim()) &&
    message.length <= MAX_LENGTH &&
    !sending &&
    !disabled;

  async function handleSend() {
    if (!canSend || submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setSending(true);
    setError("");

    try {
      await onSend(message.trim());
      setMessage("");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      submittingRef.current = false;
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Manual Reply
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Write a response to the customer.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <textarea
        aria-label="Manual reply"
        value={message}
        maxLength={MAX_LENGTH}
        rows={5}
        disabled={sending || disabled}
        placeholder="Write your response here..."
        onChange={(event) => {
          setMessage(event.target.value);
          setError("");
        }}
        onKeyDown={(event) => {
          if (
            (event.ctrlKey || event.metaKey) &&
            event.key === "Enter"
          ) {
            event.preventDefault();
            void handleSend();
          }
        }}
        className="w-full resize-y rounded-lg border border-gray-300 p-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className={`text-xs ${
              message.length >= MAX_LENGTH
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {message.length} / {MAX_LENGTH} characters
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Press Ctrl + Enter to send
          </p>
        </div>

        <button
          type="button"
          disabled={!canSend}
          onClick={() => void handleSend()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Send size={17} />
          )}

          {sending ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </div>
  );
}