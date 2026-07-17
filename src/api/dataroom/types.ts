export type DataRoom = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type DataRoomTree = {
  dataRoom: DataRoom;
  folders: import("@/api/folders").Folder[];
  files: import("@/api/files").DataRoomFile[];
};

export type PaginatedDataRoomTree = DataRoomTree & {
  pagination: import("@/shared/lib/pagination").Pagination;
};
