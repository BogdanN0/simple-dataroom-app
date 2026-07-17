import { getFromDatabase, setInDatabase } from "@/shared/lib/indexedDb";
import { filesApi } from "@/api/files";
import type { CreateFolderInput, Folder } from "./types";
import { paginate, type PaginationParams } from "@/shared/lib/pagination";
import { normalizeName } from "../../shared/lib/normalizeName";

const FOLDERS_KEY = "folders";

class FolderApiError extends Error {}

async function getFolders(): Promise<Folder[]> {
  return (await getFromDatabase<Folder[]>(FOLDERS_KEY)) ?? [];
}

function getDescendantIds(folders: Folder[], id: string): string[] {
  const ids = [id];
  for (let index = 0; index < ids.length; index += 1) {
    ids.push(
      ...folders
        .filter((folder) => folder.parentId === ids[index])
        .map((folder) => folder.id),
    );
  }
  return ids;
}

function validateName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new FolderApiError("Enter a folder name.");
  return trimmed;
}

export const foldersApi = {
  async listByDataRoomId(dataRoomId: string): Promise<Folder[]> {
    return (await getFolders()).filter(
      (folder) => folder.dataRoomId === dataRoomId,
    );
  },

  async getById(id: string): Promise<Folder> {
    const folder = (await getFolders()).find((item) => item.id === id);
    if (!folder) throw new FolderApiError("This folder no longer exists.");
    return folder;
  },

  // GET /api/folders/:id/tree
  async getTree(id: string): Promise<import("./types").FolderTree> {
    const folder = await this.getById(id);
    const [folders, files] = await Promise.all([
      this.listChildren(folder.dataRoomId, id),
      filesApi.listChildren(folder.dataRoomId, id),
    ]);
    return { folder, folders, files };
  },

  async getTreePage(id: string, params?: PaginationParams, search = "") {
    const folder = await this.getById(id);
    const [folders, files] = search
      ? await Promise.all([
          this.searchDescendants(id, search),
          filesApi.searchDescendants(id, search),
        ])
      : await Promise.all([
          this.listChildren(folder.dataRoomId, id),
          filesApi.listChildren(folder.dataRoomId, id),
        ]);
    const page = paginate(
      [
        ...folders.map((item) => ({ kind: "folder" as const, item })),
        ...files.map((item) => ({ kind: "file" as const, item })),
      ],
      params,
    );
    return {
      folder,
      folders: page.items
        .filter((entry) => entry.kind === "folder")
        .map((entry) => entry.item),
      files: page.items
        .filter((entry) => entry.kind === "file")
        .map((entry) => entry.item),
      pagination: {
        page: page.page,
        pageSize: page.pageSize,
        totalItems: page.totalItems,
        totalPages: page.totalPages,
      },
    };
  },

  async getDescendantIds(id: string): Promise<string[]> {
    const folders = await getFolders();
    return getDescendantIds(folders, id);
  },

  async getAncestors(id: string): Promise<Folder[]> {
    const folders = await getFolders();
    const ancestors: Folder[] = [];
    let current = folders.find((folder) => folder.id === id);
    while (current) {
      ancestors.unshift(current);
      current = current.parentId
        ? folders.find((folder) => folder.id === current?.parentId)
        : undefined;
    }
    return ancestors;
  },
  async listChildren(
    dataRoomId: string,
    parentId: string | null,
  ): Promise<Folder[]> {
    const folders = await getFolders();
    return folders.filter(
      (folder) =>
        folder.dataRoomId === dataRoomId && folder.parentId === parentId,
    );
  },

  async removeByDataRoomId(dataRoomId: string): Promise<void> {
    const folders = await getFolders();
    await setInDatabase(
      FOLDERS_KEY,
      folders.filter((folder) => folder.dataRoomId !== dataRoomId),
    );
  },

  async search(dataRoomId: string, query: string): Promise<Folder[]> {
    const normalizedQuery = normalizeName(query);
    if (!normalizedQuery) return [];
    return (await getFolders()).filter(
      (folder) =>
        folder.dataRoomId === dataRoomId &&
        folder.normalizedName.includes(normalizedQuery),
    );
  },

  async searchDescendants(folderId: string, query: string): Promise<Folder[]> {
    const normalizedQuery = normalizeName(query);
    if (!normalizedQuery) return [];
    const descendantIds = new Set(await this.getDescendantIds(folderId));
    return (await getFolders()).filter(
      (folder) =>
        folder.id !== folderId &&
        descendantIds.has(folder.id) &&
        folder.normalizedName.includes(normalizedQuery),
    );
  },

  // POST /api/folders
  async create(input: CreateFolderInput): Promise<Folder> {
    const name = validateName(input.name);
    const folders = await getFolders();
    const normalizedName = normalizeName(name);
    if (
      folders.some(
        (folder) =>
          folder.dataRoomId === input.dataRoomId &&
          folder.parentId === input.parentId &&
          folder.normalizedName === normalizedName,
      )
    ) {
      throw new FolderApiError("A folder with this name already exists here.");
    }
    const now = new Date().toISOString();
    const folder: Folder = {
      ...input,
      id: crypto.randomUUID(),
      name,
      normalizedName,
      createdAt: now,
      updatedAt: now,
    };
    await setInDatabase(FOLDERS_KEY, [...folders, folder]);
    return folder;
  },

  // PUT /api/folders/:id
  async rename(id: string, name: string): Promise<Folder> {
    const folders = await getFolders();
    const existing = folders.find((folder) => folder.id === id);
    if (!existing) throw new FolderApiError("This folder no longer exists.");
    const nextName = validateName(name);
    const normalizedName = normalizeName(nextName);
    if (
      folders.some(
        (folder) =>
          folder.id !== id &&
          folder.dataRoomId === existing.dataRoomId &&
          folder.parentId === existing.parentId &&
          folder.normalizedName === normalizedName,
      )
    ) {
      throw new FolderApiError("A folder with this name already exists here.");
    }
    const updated = {
      ...existing,
      name: nextName,
      normalizedName,
      updatedAt: new Date().toISOString(),
    };
    await setInDatabase(
      FOLDERS_KEY,
      folders.map((folder) => (folder.id === id ? updated : folder)),
    );
    return updated;
  },

  // DELETE /api/folders/:id
  async remove(id: string): Promise<void> {
    const folders = await getFolders();
    if (!folders.some((folder) => folder.id === id))
      throw new FolderApiError("This folder no longer exists.");
    const descendantIds = getDescendantIds(folders, id);
    await filesApi.removeByParentIds(descendantIds);
    const descendantIdSet = new Set(descendantIds);
    await setInDatabase(
      FOLDERS_KEY,
      folders.filter((folder) => !descendantIdSet.has(folder.id)),
    );
  },
};
