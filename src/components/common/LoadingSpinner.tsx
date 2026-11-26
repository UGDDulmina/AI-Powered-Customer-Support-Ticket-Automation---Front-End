
interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-4 py-12"
    >
      <div
        aria-hidden="true"
        className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"
      />

      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
