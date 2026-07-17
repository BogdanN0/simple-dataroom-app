import { ContentCreationActions } from "./ContentCreationActions";
import { TextInputForm } from "./TextInputForm";

type ContentHeaderProps = {
  className?: string;
  kind: "Data room" | "Folder";
  onCreateFolder: () => void;
  onSearchChange: (value: string) => void;
  onUploadFile: () => void;
  searchId: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  title: string | undefined;
};

export function ContentHeader({
  className = "mt-7",
  kind,
  onCreateFolder,
  onSearchChange,
  onUploadFile,
  searchId,
  searchLabel,
  searchPlaceholder,
  searchValue,
  title,
}: ContentHeaderProps) {
  return (
    <header
      className={`${className} rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-sm`}
    >
      <p className="text-sm font-medium text-indigo-600">{kind}</p>
      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>
        <div className="flex flex-col gap-2 sm:flex-row">
          <TextInputForm
            id={searchId}
            label={searchLabel}
            onChange={onSearchChange}
            onSubmit={(event) => event.preventDefault()}
            placeholder={searchPlaceholder}
            value={searchValue}
          />
          <ContentCreationActions
            onCreateFolder={onCreateFolder}
            onUploadFile={onUploadFile}
          />
        </div>
      </div>
    </header>
  );
}
