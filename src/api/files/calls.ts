import {
  deleteFromDatabase,
  getFromDatabase,
  setInDatabase,
} from "@/shared/lib/indexedDb";
import { foldersApi } from "@/api/folders";
import type { DataRoomFile, UploadFileInput } from "./types";
import { normalizeName } from "../../shared/lib/normalizeName";

const FILES_KEY = "files";

class FileApiError extends Error {}
async function getFiles(): Promise<DataRoomFile[]> {
  return (await getFromDatabase<DataRoomFile[]>(FILES_KEY)) ?? [];
}

export const filesApi = {
  async listChildren(
    dataRoomId: string,
    parentId: string | null,
  ): Promise<DataRoomFile[]> {
    return (await getFiles()).filter(
      (file) => file.dataRoomId === dataRoomId && file.parentId === parentId,
    );
  },
  async search(dataRoomId: string, query: string): Promise<DataRoomFile[]> {
    const normalizedQuery = normalizeName(query);
    if (!normalizedQuery) return [];
    return (await getFiles()).filter(
      (file) =>
        file.dataRoomId === dataRoomId &&
        file.normalizedName.includes(normalizedQuery),
    );
  },
  async searchDescendants(
    folderId: string,
    query: string,
  ): Promise<DataRoomFile[]> {
    const normalizedQuery = normalizeName(query);
    if (!normalizedQuery) return [];
    const descendantIds = new Set(await foldersApi.getDescendantIds(folderId));
    return (await getFiles()).filter(
      (file) =>
        file.parentId !== null &&
        descendantIds.has(file.parentId) &&
        file.normalizedName.includes(normalizedQuery),
    );
  },
  // POST /api/files
  async upload(input: UploadFileInput): Promise<DataRoomFile> {
    if (input.file.type !== "application/pdf")
      throw new FileApiError("Only PDF files can be uploaded.");
    const name = input.file.name.trim();
    if (!name) throw new FileApiError("Choose a file to upload.");
    const files = await getFiles();
    const normalizedName = normalizeName(name);
    if (
      files.some(
        (file) =>
          file.dataRoomId === input.dataRoomId &&
          file.parentId === input.parentId &&
          file.normalizedName === normalizedName,
      )
    )
      throw new FileApiError("A file with this name already exists here.");
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const blobKey = `file-blob:${id}`;
    const storedFile: DataRoomFile = {
      id,
      dataRoomId: input.dataRoomId,
      parentType: input.parentType,
      parentId: input.parentId,
      name,
      type: "application/pdf",
      size: input.file.size,
      blobKey,
      normalizedName,
      createdAt: now,
      updatedAt: now,
    };
    await setInDatabase(blobKey, input.file);
    await setInDatabase(FILES_KEY, [...files, storedFile]);
    return storedFile;
  },
  // PUT /api/files/:id
  async rename(id: string, name: string): Promise<DataRoomFile> {
    const files = await getFiles();
    const existing = files.find((file) => file.id === id);
    if (!existing) throw new FileApiError("This file no longer exists.");
    const nextName = name.trim();
    if (!nextName) throw new FileApiError("Enter a file name.");
    const normalizedName = normalizeName(nextName);
    if (
      files.some(
        (file) =>
          file.id !== id &&
          file.dataRoomId === existing.dataRoomId &&
          file.parentId === existing.parentId &&
          file.normalizedName === normalizedName,
      )
    )
      throw new FileApiError("A file with this name already exists here.");
    const updated = {
      ...existing,
      name: nextName,
      normalizedName,
      updatedAt: new Date().toISOString(),
    };
    await setInDatabase(
      FILES_KEY,
      files.map((file) => (file.id === id ? updated : file)),
    );
    return updated;
  },
  // DELETE /api/files/:id
  async remove(id: string): Promise<void> {
    const files = await getFiles();
    const existing = files.find((file) => file.id === id);
    if (!existing) throw new FileApiError("This file no longer exists.");
    await deleteFromDatabase(existing.blobKey);
    await setInDatabase(
      FILES_KEY,
      files.filter((file) => file.id !== id),
    );
  },
  async removeByParentIds(parentIds: string[]): Promise<void> {
    const parentIdSet = new Set(parentIds);
    const files = await getFiles();
    const removedFiles = files.filter(
      (file) => file.parentId !== null && parentIdSet.has(file.parentId),
    );
    await Promise.all(
      removedFiles.map((file) => deleteFromDatabase(file.blobKey)),
    );
    await setInDatabase(
      FILES_KEY,
      files.filter((file) => !removedFiles.includes(file)),
    );
  },
  async removeByDataRoomId(dataRoomId: string): Promise<void> {
    const files = await getFiles();
    const removedFiles = files.filter((file) => file.dataRoomId === dataRoomId);
    await Promise.all(
      removedFiles.map((file) => deleteFromDatabase(file.blobKey)),
    );
    await setInDatabase(
      FILES_KEY,
      files.filter((file) => file.dataRoomId !== dataRoomId),
    );
  },
  // GET /api/files/:id/download
  async download(id: string): Promise<File> {
    const file = (await getFiles()).find((item) => item.id === id);
    if (!file) throw new FileApiError("This file no longer exists.");
    const blob = await getFromDatabase<File>(file.blobKey);
    if (!blob) throw new FileApiError("The uploaded file could not be found.");
    return blob;
  },
};
