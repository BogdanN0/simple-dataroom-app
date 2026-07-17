import type { DataRoom } from "@/api/dataroom";
import { RoomIcon } from "@/shared/ui/icons";
import { ResourceCard } from "@/shared/ui/ResourceCard";

export function RoomCard({
  room,
  onDelete,
  onRename,
}: {
  room: DataRoom;
  onDelete: (room: DataRoom) => void;
  onRename: (room: DataRoom) => void;
}) {
  return (
    <ResourceCard
      actions={
        <>
          <button
            aria-label={`Rename ${room.name}`}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            onClick={() => onRename(room)}
            type="button"
          >
            <span aria-hidden="true">✎</span>
          </button>
          <button
            aria-label={`Delete ${room.name}`}
            className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-600"
            onClick={() => onDelete(room)}
            type="button"
          >
            <span aria-hidden="true">⌫</span>
          </button>
        </>
      }
      createdAt={room.createdAt}
      href={`/datarooms/${room.id}`}
      icon={<RoomIcon />}
      name={room.name}
    />
  );
}
