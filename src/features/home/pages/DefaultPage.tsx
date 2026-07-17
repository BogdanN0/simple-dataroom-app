import { useWorkspaceQuery } from "@/api/home";
import { Loading } from "@/shared/ui/Loading";

export function DefaultPage() {
  const { data, error, isLoading } = useWorkspaceQuery();

  if (isLoading) return <Loading label="Loading application" overlay />;

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <p className="text-sm text-slate-600">Unable to load the mock setup.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-6" aria-label="Dataroom application">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">React Query mock setup</p>
        <div className="mt-4 space-y-2">
          {data?.map((item) => (
            <div key={item.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {item.name}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
