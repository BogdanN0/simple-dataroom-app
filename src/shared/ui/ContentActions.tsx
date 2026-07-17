import type { DataRoomFile } from "@/api/files";
import type { Folder } from "@/api/folders";

export type ContentItem =
  | ({ kind: "folder" } & Folder)
  | ({ kind: "file" } & DataRoomFile);

type ContentActionsProps = {
  item: ContentItem;
  onDelete: (item: ContentItem) => void;
  onRename: (item: ContentItem) => void;
};

export function ContentActions({
  item,
  onDelete,
  onRename,
}: ContentActionsProps) {
  return (
    <>
      <button
        aria-label={`Rename ${item.name}`}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        onClick={() => onRename(item)}
        type="button"
      >
        <span aria-hidden="true">✎</span>
      </button>
      <button
        aria-label={`Delete ${item.name}`}
        className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-600"
        onClick={() => onDelete(item)}
        type="button"
      >
        <span aria-hidden="true">⌫</span>
      </button>
    </>
  );
}
