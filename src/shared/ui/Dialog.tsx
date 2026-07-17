import type { ReactNode } from "react";

export function Dialog({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-10 grid place-items-center bg-slate-950/35 p-4">
      <section
        aria-label={title}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            aria-label="Close"
            className="text-slate-500 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
}

export function DialogActions({
  pending,
  submitLabel,
}: {
  pending: boolean;
  submitLabel: string;
}) {
  return (
    <div className="mt-6 flex justify-end">
      <button
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-indigo-300"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}
