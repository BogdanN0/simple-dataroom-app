import type { ParentType } from "@/api/folders";

export type DataRoomFile = {
  id: string;
  dataRoomId: string;
  parentType: ParentType;
  parentId: string | null;
  name: string;
  type: "application/pdf";
  size: number;
  blobKey: string;
  normalizedName: string;
  createdAt: string;
  updatedAt: string;
};

export type UploadFileInput = {
  dataRoomId: string;
  parentType: ParentType;
  parentId: string | null;
  file: File;
};
