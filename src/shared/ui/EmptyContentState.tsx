type EmptyContentStateProps = {
  isSearching: boolean;
  emptyTitle: string;
  emptyDescription: string;
  searchDescription: string;
};

export function EmptyContentState({
  isSearching,
  emptyTitle,
  emptyDescription,
  searchDescription,
}: EmptyContentStateProps) {
  return (
    <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-xl text-slate-500">
          ⌁
        </div>
        <h2 className="mt-4 font-semibold text-slate-900">
          {isSearching ? "No matching files or folders" : emptyTitle}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {isSearching ? searchDescription : emptyDescription}
        </p>
      </div>
    </div>
  );
}
