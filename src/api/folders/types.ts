export type ParentType = "dataRoom" | "folder";

export type Folder = {
  id: string;
  dataRoomId: string;
  parentType: ParentType;
  parentId: string | null;
  name: string;
  normalizedName: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateFolderInput = {
  dataRoomId: string;
  parentType: ParentType;
  parentId: string | null;
  name: string;
};

export type FolderTree = {
  folder: Folder;
  folders: Folder[];
  files: import("@/api/files").DataRoomFile[];
};

export type PaginatedFolderTree = FolderTree & {
  pagination: import("@/shared/lib/pagination").Pagination;
};
