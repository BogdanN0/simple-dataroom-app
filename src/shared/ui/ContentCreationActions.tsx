type ContentCreationActionsProps = {
  onCreateFolder: () => void;
  onUploadFile: () => void;
};

export function ContentCreationActions({
  onCreateFolder,
  onUploadFile,
}: ContentCreationActionsProps) {
  return (
    <>
      <button
        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        onClick={onCreateFolder}
        type="button"
      >
        Create folder
      </button>
      <button
        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        onClick={onUploadFile}
        type="button"
      >
        Upload file
      </button>
    </>
  );
}
