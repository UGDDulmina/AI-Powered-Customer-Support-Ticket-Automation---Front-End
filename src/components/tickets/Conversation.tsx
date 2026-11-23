
export interface ConversationMessage {
  id: number;
  content: string;
  senderLabel: string;
  senderType: "customer" | "agent" | "system";
  createdAt?: string;
}

interface ConversationProps {
  messages: ConversationMessage[];
}

export default function Conversation({
  messages,
}: ConversationProps) {
  if (messages.length === 0) {
    return (
      <div className="rounded-lg bg-slate-50 p-6 text-center text-slate-500">
        No messages in this conversation yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isAgent = message.senderType === "agent";

        return (
          <div
            key={message.id}
            className={`flex ${
              isAgent ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-4 ${
                isAgent
                  ? "bg-blue-50 text-slate-900"
                  : "bg-slate-100 text-slate-900"
              }`}
            >
              <p className="mb-2 text-xs font-semibold text-slate-500">
                {message.senderLabel}
              </p>

              <p className="whitespace-pre-wrap">
                {message.content}
              </p>

              {message.createdAt && (
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(
                    message.createdAt
                  ).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
