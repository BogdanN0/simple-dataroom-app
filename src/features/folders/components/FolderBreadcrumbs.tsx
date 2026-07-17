import { Link } from "react-router-dom";
import type { Folder } from "@/api/folders";

export function FolderBreadcrumbs({
  dataRoomId,
  folders,
}: {
  dataRoomId: string;
  folders: Folder[];
}) {
  return (
    <nav
      aria-label="Folder path"
      className="flex flex-wrap items-center gap-2 text-sm"
    >
      <Link
        className="font-semibold text-slate-600 hover:text-indigo-700"
        to={`/datarooms/${dataRoomId}`}
      >
        Data room
      </Link>
      {folders.map((folder, index) => (
        <span className="flex items-center gap-2" key={folder.id}>
          <span aria-hidden="true" className="text-slate-400">
            ›
          </span>
          {index === folders.length - 1 ? (
            <span
              aria-current="page"
              className="rounded-md bg-indigo-100 px-2 py-1 font-semibold text-indigo-800"
            >
              {folder.name}
            </span>
          ) : (
            <Link
              className="font-semibold text-slate-600 hover:text-indigo-700"
              to={`/datarooms/${dataRoomId}/folders/${folder.id}`}
            >
              {folder.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
