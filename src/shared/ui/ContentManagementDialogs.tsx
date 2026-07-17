import type { FormEventHandler } from "react";
import { Dialog, DialogActions } from "./Dialog";

export type ManageableItem = {
  kind: string;
  name: string;
};

type ContentManagementDialogsProps = {
  deleting: ManageableItem | null;
  deleteError?: string;
  deletePending: boolean;
  editName: string;
  editing: ManageableItem | null;
  onCloseDelete: () => void;
  onCloseRename: () => void;
  onConfirmDelete: () => void;
  onEditNameChange: (value: string) => void;
  onRename: FormEventHandler<HTMLFormElement>;
  renameError?: string;
  renamePending: boolean;
};

export function ContentManagementDialogs({
  deleting,
  deleteError,
  deletePending,
  editName,
  editing,
  onCloseDelete,
  onCloseRename,
  onConfirmDelete,
  onEditNameChange,
  onRename,
  renameError,
  renamePending,
}: ContentManagementDialogsProps) {
  return (
    <>
      {editing && (
        <Dialog title={`Rename ${editing.kind}`} onClose={onCloseRename}>
          <form onSubmit={onRename}>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="rename-content"
            >
              Name
            </label>
            <input
              autoFocus
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5"
              id="rename-content"
              onChange={(event) => onEditNameChange(event.target.value)}
              value={editName}
            />
            {renameError && (
              <p className="mt-2 text-sm text-rose-700">{renameError}</p>
            )}
            <DialogActions pending={renamePending} submitLabel="Save" />
          </form>
        </Dialog>
      )}
      {deleting && (
        <Dialog title={`Delete ${deleting.kind}?`} onClose={onCloseDelete}>
          <p className="text-sm leading-6 text-slate-600">
            “{deleting.name}” will be removed.
          </p>
          {deleteError && (
            <p className="mt-2 text-sm text-rose-700">{deleteError}</p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              onClick={onCloseDelete}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-rose-300"
              disabled={deletePending}
              onClick={onConfirmDelete}
              type="button"
            >
              {deletePending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
