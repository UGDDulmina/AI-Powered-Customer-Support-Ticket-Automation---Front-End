
import { useState } from "react";

interface ReplyComposerProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

export default function ReplyComposer({
  onSend,
  disabled = false,
}: ReplyComposerProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    const content = message.trim();

    if (!content || sending || disabled) {
      return;
    }

    setSending(true);
    setError("");

    try {
      await onSend(content);
      setMessage("");
    } catch {
      setError("Unable to save the reply. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block font-semibold">
        Manual Reply
      </label>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={sending || disabled}
        placeholder="Write your response..."
        rows={4}
        className="w-full rounded-lg border border-slate-300 p-3"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={
            !message.trim() || sending || disabled
          }
          className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
        >
          {sending ? "Saving..." : "Save Reply"}
        </button>
      </div>
    </div>
  );
}
