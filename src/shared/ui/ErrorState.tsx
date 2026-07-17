type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  compact?: boolean;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  compact = false,
}: ErrorStateProps) {
  return (
    <section
      className={`rounded-2xl border border-rose-200 bg-rose-50 text-rose-950 ${compact ? "p-4" : "p-6"}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
          !
        </span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-rose-800">{message}</p>
          {onRetry && (
            <button
              className="mt-4 rounded-lg bg-rose-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2"
              onClick={onRetry}
              type="button"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
