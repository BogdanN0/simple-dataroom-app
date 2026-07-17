import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateDataRoomMutation,
  useDataRoomsPageQuery,
  useDeleteDataRoomMutation,
  useRenameDataRoomMutation,
  type DataRoom,
} from "@/api/dataroom";
import { ErrorState } from "@/shared/ui/ErrorState";
import { ContentManagementDialogs } from "@/shared/ui/ContentManagementDialogs";
import { TextInputForm } from "@/shared/ui/TextInputForm";
import { Loading } from "@/shared/ui/Loading";
import { RoomIcon } from "@/shared/ui/icons";
import { RoomCard } from "../components/RoomCard";
import { Pagination } from "@/shared/ui/Pagination";

const PAGE_SIZE = 9;

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Please try again in a moment.";

export function DataRoomsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const roomsQuery = useDataRoomsPageQuery(page, PAGE_SIZE);
  const createRoom = useCreateDataRoomMutation();
  const renameRoom = useRenameDataRoomMutation();
  const deleteRoom = useDeleteDataRoomMutation();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<DataRoom | null>(null);
  const [editName, setEditName] = useState("");
  const [deleting, setDeleting] = useState<DataRoom | null>(null);

  async function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createRoom.reset();
    try {
      const room = await createRoom.mutateAsync({ name: newName });
      setNewName("");
      navigate(`/datarooms/${room.id}`);
    } catch {
      /* surfaced near the form */
    }
  }

  async function submitRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    renameRoom.reset();
    try {
      await renameRoom.mutateAsync({
        id: editing.id,
        input: { name: editName },
      });
      setEditing(null);
    } catch {
      /* surfaced in the dialog */
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    deleteRoom.reset();
    try {
      await deleteRoom.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      /* surfaced in the dialog */
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0e7ff_0,_transparent_30rem)] px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Data rooms
            </h1>
            <p className="mt-2 text-slate-600">
              Organize confidential files and folders in one place.
            </p>
          </div>
          <TextInputForm
            buttonLabel="Create"
            disabled={createRoom.isPending}
            error={
              createRoom.error ? errorMessage(createRoom.error) : undefined
            }
            id="data-room-name"
            label="New data room name"
            loadingLabel="Creating…"
            onChange={setNewName}
            onSubmit={submitCreate}
            placeholder="Name your data room"
            value={newName}
          />
        </header>

        <section className="mt-12" aria-label="Your data rooms">
          {roomsQuery.isLoading ? <Loading label="Loading data rooms" /> : null}
          {roomsQuery.error ? (
            <ErrorState
              message={errorMessage(roomsQuery.error)}
              onRetry={() => roomsQuery.refetch()}
              title="Unable to load data rooms"
            />
          ) : null}
          {roomsQuery.data?.totalItems === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/75 px-6 py-16 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                <RoomIcon />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                Your workspace is ready
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
                Create your first data room to begin organizing files securely.
              </p>
            </div>
          ) : null}
          {roomsQuery.data && roomsQuery.data.totalItems > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roomsQuery.data.items.map((room) => (
                <RoomCard
                  key={room.id}
                  onDelete={setDeleting}
                  onRename={(room) => {
                    setEditName(room.name);
                    setEditing(room);
                  }}
                  room={room}
                />
              ))}
            </div>
          ) : null}
          {roomsQuery.data ? (
            <Pagination
              onPageChange={setPage}
              page={roomsQuery.data.page}
              totalPages={roomsQuery.data.totalPages}
            />
          ) : null}
        </section>
      </div>
      <ContentManagementDialogs
        deleting={deleting ? { ...deleting, kind: "data room" } : null}
        deleteError={
          deleteRoom.error ? errorMessage(deleteRoom.error) : undefined
        }
        deletePending={deleteRoom.isPending}
        editName={editName}
        editing={editing ? { ...editing, kind: "data room" } : null}
        onCloseDelete={() => setDeleting(null)}
        onCloseRename={() => setEditing(null)}
        onConfirmDelete={confirmDelete}
        onEditNameChange={setEditName}
        onRename={submitRename}
        renameError={
          renameRoom.error ? errorMessage(renameRoom.error) : undefined
        }
        renamePending={renameRoom.isPending}
      />
    </main>
  );
}
