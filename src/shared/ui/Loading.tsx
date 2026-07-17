type LoadingProps = {
  label?: string;
  overlay?: boolean;
};

export function Loading({ label = "Loading", overlay = false }: LoadingProps) {
  const content = (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-slate-50">
        {content}
      </div>
    );
  }

  return <div className="grid place-items-center py-8">{content}</div>;
}
