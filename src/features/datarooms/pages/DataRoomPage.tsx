import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDataRoomTreePageQuery } from "@/api/dataroom";
import {
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useFoldersInDataRoomQuery,
  useRenameFolderMutation,
} from "@/api/folders";
import {
  filesApi,
  type DataRoomFile,
  useDeleteFileMutation,
  useRenameFileMutation,
  useUploadFileMutation,
} from "@/api/files";
import { debounce } from "@/shared/lib/debounce";
import { Dialog, DialogActions } from "@/shared/ui/Dialog";
import { ErrorState } from "@/shared/ui/ErrorState";
import { EmptyContentState } from "@/shared/ui/EmptyContentState";
import { FolderIcon, PdfIcon } from "@/shared/ui/icons";
import { Loading } from "@/shared/ui/Loading";
import { ResourceCard } from "@/shared/ui/ResourceCard";
import { ContentHeader } from "@/shared/ui/ContentHeader";
import { ContentActions, type ContentItem } from "@/shared/ui/ContentActions";
import { ContentManagementDialogs } from "@/shared/ui/ContentManagementDialogs";
import { Pagination } from "@/shared/ui/Pagination";

const PAGE_SIZE = 9;

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Please try again in a moment.";

export function DataRoomPage() {
  const { id = "" } = useParams();
  const createFolder = useCreateFolderMutation();
  const uploadFile = useUploadFileMutation();
  const renameFolder = useRenameFolderMutation();
  const deleteFolder = useDeleteFolderMutation();
  const renameFile = useRenameFileMutation();
  const deleteFile = useDeleteFileMutation();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const treeQuery = useDataRoomTreePageQuery(id, page, PAGE_SIZE, search);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [editName, setEditName] = useState("");
  const [deleting, setDeleting] = useState<ContentItem | null>(null);
  const allFoldersQuery = useFoldersInDataRoomQuery(id);

  const setDebouncedSearch = useMemo(() => debounce(setSearch, 300), []);
  useEffect(() => () => setDebouncedSearch.cancel(), [setDebouncedSearch]);
  function changeSearch(value: string) {
    setSearchInput(value);
    setPage(1);
    setDebouncedSearch(value.trim());
  }

  async function submitFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createFolder.reset();
    try {
      await createFolder.mutateAsync({
        dataRoomId: id,
        parentType: "dataRoom",
        parentId: null,
        name: folderName,
      });
      setFolderName("");
      setFolderDialogOpen(false);
      await treeQuery.refetch();
    } catch {
      /* shown in dialog */
    }
  }
  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    uploadFile.reset();
    if (!selectedFile) return;
    try {
      await uploadFile.mutateAsync({
        dataRoomId: id,
        parentType: "dataRoom",
        parentId: null,
        file: selectedFile,
      });
      setSelectedFile(null);
      setUploadDialogOpen(false);
      await treeQuery.refetch();
    } catch {
      /* shown in dialog */
    }
  }
  async function downloadFile(id: string, name: string) {
    setDownloadError(null);
    try {
      const file = await filesApi.download(id);
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(errorMessage(error));
    }
  }
  async function submitRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    try {
      if (editing.kind === "folder")
        await renameFolder.mutateAsync({ id: editing.id, name: editName });
      else await renameFile.mutateAsync({ id: editing.id, name: editName });
      setEditing(null);
      await treeQuery.refetch();
    } catch {
      /* surfaced in dialog */
    }
  }
  async function confirmDelete() {
    if (!deleting) return;
    try {
      if (deleting.kind === "folder")
        await deleteFolder.mutateAsync(deleting.id);
      else await deleteFile.mutateAsync(deleting.id);
      setDeleting(null);
      await treeQuery.refetch();
    } catch {
      /* surfaced in dialog */
    }
  }

  if (treeQuery.isLoading) return <Loading label="Opening data room" overlay />;
  if (treeQuery.error)
    return (
      <main className="grid min-h-screen place-items-center p-5">
        <div className="w-full max-w-md">
          <ErrorState
            message={errorMessage(treeQuery.error)}
            onRetry={() => treeQuery.refetch()}
            title="Unable to open data room"
          />
          <Link
            className="mt-5 inline-block text-sm font-semibold text-indigo-700"
            to="/"
          >
            ← Back to data rooms
          </Link>
        </div>
      </main>
    );

  const room = treeQuery.data?.dataRoom;
  const folders = treeQuery.data?.folders ?? [];
  const files = treeQuery.data?.files ?? [];
  const isSearching = Boolean(search) && treeQuery.isLoading;
  const folderNames = new Map(
    (allFoldersQuery.data ?? []).map((folder) => [folder.id, folder.name]),
  );
  const fileLocation = (file: DataRoomFile) =>
    file.parentId
      ? `In ${folderNames.get(file.parentId) ?? "folder"}`
      : `In ${room?.name ?? "data room"}`;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700"
          to="/"
        >
          ← All data rooms
        </Link>
        <ContentHeader
          kind="Data room"
          onCreateFolder={() => setFolderDialogOpen(true)}
          onSearchChange={changeSearch}
          onUploadFile={() => setUploadDialogOpen(true)}
          searchId="data-room-search"
          searchLabel="Search folders and files"
          searchPlaceholder="Search folders and files"
          searchValue={searchInput}
          title={room?.name}
        />
        <section aria-label="Data room contents" className="mt-6">
          {isSearching ? <Loading label="Searching contents" /> : null}
          {downloadError ? (
            <ErrorState
              compact
              message={downloadError}
              title={
                downloadError
                  ? "Unable to download file"
                  : "Unable to search contents"
              }
            />
          ) : null}
          {!isSearching && folders.length === 0 && files.length === 0 ? (
            <EmptyContentState
              emptyDescription="Create a folder or upload a PDF to get started."
              emptyTitle="This data room is empty"
              isSearching={Boolean(search)}
              searchDescription="Try a different search term."
            />
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <ResourceCard
                actions={
                  <ContentActions
                    item={{ ...folder, kind: "folder" }}
                    onDelete={setDeleting}
                    onRename={(item) => {
                      setEditName(item.name);
                      setEditing(item);
                    }}
                  />
                }
                createdAt={folder.createdAt}
                href={`/datarooms/${id}/folders/${folder.id}`}
                icon={<FolderIcon />}
                key={folder.id}
                name={folder.name}
              />
            ))}
            {files.map((file) => (
              <ResourceCard
                actions={
                  <ContentActions
                    item={{ ...file, kind: "file" }}
                    onDelete={setDeleting}
                    onRename={(item) => {
                      setEditName(item.name);
                      setEditing(item);
                    }}
                  />
                }
                createdAt={file.createdAt}
                description={fileLocation(file)}
                icon={<PdfIcon />}
                key={file.id}
                onClick={() => downloadFile(file.id, file.name)}
                name={file.name}
              />
            ))}
          </div>
          {treeQuery.data ? (
            <Pagination
              onPageChange={setPage}
              page={treeQuery.data.pagination.page}
              totalPages={treeQuery.data.pagination.totalPages}
            />
          ) : null}
        </section>
      </div>
      {folderDialogOpen && (
        <Dialog
          title="Create folder"
          onClose={() => setFolderDialogOpen(false)}
        >
          <form onSubmit={submitFolder}>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="folder-name"
            >
              Folder name
            </label>
            <input
              autoFocus
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5"
              id="folder-name"
              onChange={(event) => setFolderName(event.target.value)}
              value={folderName}
            />
            {createFolder.error && (
              <p className="mt-2 text-sm text-rose-700">
                {errorMessage(createFolder.error)}
              </p>
            )}
            <DialogActions
              pending={createFolder.isPending}
              submitLabel="Create folder"
            />
          </form>
        </Dialog>
      )}
      {uploadDialogOpen && (
        <Dialog title="Upload PDF" onClose={() => setUploadDialogOpen(false)}>
          <form onSubmit={submitUpload}>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="pdf-file"
            >
              PDF file
            </label>
            <input
              accept="application/pdf,.pdf"
              className="mt-2 block w-full text-sm"
              id="pdf-file"
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] ?? null)
              }
              type="file"
            />
            {uploadFile.error && (
              <p className="mt-2 text-sm text-rose-700">
                {errorMessage(uploadFile.error)}
              </p>
            )}
            <DialogActions
              pending={uploadFile.isPending}
              submitLabel="Upload"
            />
          </form>
        </Dialog>
      )}
      <ContentManagementDialogs
        deleting={deleting}
        deleteError={
          deleteFolder.error || deleteFile.error
            ? errorMessage(deleteFolder.error ?? deleteFile.error)
            : undefined
        }
        deletePending={deleteFolder.isPending || deleteFile.isPending}
        editName={editName}
        editing={editing}
        onCloseDelete={() => setDeleting(null)}
        onCloseRename={() => setEditing(null)}
        onConfirmDelete={confirmDelete}
        onEditNameChange={setEditName}
        onRename={submitRename}
        renameError={
          renameFolder.error || renameFile.error
            ? errorMessage(renameFolder.error ?? renameFile.error)
            : undefined
        }
        renamePending={renameFolder.isPending || renameFile.isPending}
      />
    </main>
  );
}
