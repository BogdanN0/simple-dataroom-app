import {
  deleteFromDatabase,
  getFromDatabase,
  setInDatabase,
} from "@/shared/lib/indexedDb";
import {
  getResourceName,
  type CreateResourceInput,
} from "@/shared/models/creation";
import { foldersApi } from "@/api/folders";
import { filesApi } from "@/api/files";
import type { DataRoom, DataRoomTree } from "./types";
import {
  paginate,
  type PaginatedResult,
  type PaginationParams,
} from "@/shared/lib/pagination";

const DATA_ROOMS_KEY = "datarooms";

class DataRoomApiError extends Error {}

async function getRooms(): Promise<DataRoom[]> {
  return (await getFromDatabase<DataRoom[]>(DATA_ROOMS_KEY)) ?? [];
}

function newId() {
  return crypto.randomUUID();
}

function validateName(
  input: CreateResourceInput,
  rooms: DataRoom[],
  excludeId?: string,
) {
  const name = getResourceName(input);
  if (!name) throw new DataRoomApiError("Enter a name for your data room.");

  const nameExists = rooms.some(
    (room) =>
      room.id !== excludeId &&
      room.name.localeCompare(name, undefined, { sensitivity: "accent" }) === 0,
  );
  if (nameExists)
    throw new DataRoomApiError("A data room with this name already exists.");
  return name;
}

/** Local IndexedDB-backed implementation of the data rooms API. */
export const dataRoomsApi = {
  async list(): Promise<DataRoom[]> {
    const rooms = await getRooms();
    return [...rooms].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async listPage(
    params?: PaginationParams,
  ): Promise<PaginatedResult<DataRoom>> {
    return paginate(await this.list(), params);
  },

  // POST /api/datarooms
  async create(input: CreateResourceInput): Promise<DataRoom> {
    const rooms = await getRooms();
    const name = validateName(input, rooms);
    const now = new Date().toISOString();
    const room: DataRoom = {
      id: newId(),
      name,
      createdAt: now,
      updatedAt: now,
    };
    await setInDatabase(DATA_ROOMS_KEY, [room, ...rooms]);
    return room;
  },

  async rename(id: string, input: CreateResourceInput): Promise<DataRoom> {
    const rooms = await getRooms();
    const existing = rooms.find((room) => room.id === id);
    if (!existing)
      throw new DataRoomApiError("This data room no longer exists.");
    const name = validateName(input, rooms, id);
    const updated = { ...existing, name, updatedAt: new Date().toISOString() };
    await setInDatabase(
      DATA_ROOMS_KEY,
      rooms.map((room) => (room.id === id ? updated : room)),
    );
    return updated;
  },

  async remove(id: string): Promise<void> {
    const rooms = await getRooms();
    if (!rooms.some((room) => room.id === id))
      throw new DataRoomApiError("This data room no longer exists.");
    await Promise.all([
      foldersApi.removeByDataRoomId(id),
      filesApi.removeByDataRoomId(id),
    ]);
    await setInDatabase(
      DATA_ROOMS_KEY,
      rooms.filter((room) => room.id !== id),
    );
  },

  // GET /api/datarooms/:id/tree
  async getTree(id: string): Promise<DataRoomTree> {
    const room = (await getRooms()).find((item) => item.id === id);
    if (!room) throw new DataRoomApiError("We couldn't find that data room.");
    const [folders, files] = await Promise.all([
      foldersApi.listChildren(id, null),
      filesApi.listChildren(id, null),
    ]);
    return { dataRoom: room, folders, files };
  },

  async getTreePage(id: string, params?: PaginationParams, search = "") {
    const room = (await getRooms()).find((item) => item.id === id);
    if (!room) throw new DataRoomApiError("We couldn't find that data room.");
    const [folders, files] = search
      ? await Promise.all([
          foldersApi.search(id, search),
          filesApi.search(id, search),
        ])
      : await Promise.all([
          foldersApi.listChildren(id, null),
          filesApi.listChildren(id, null),
        ]);
    const page = paginate(
      [
        ...folders.map((item) => ({ kind: "folder" as const, item })),
        ...files.map((item) => ({ kind: "file" as const, item })),
      ],
      params,
    );
    return {
      dataRoom: room,
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

  async clearAllForTesting(): Promise<void> {
    await deleteFromDatabase(DATA_ROOMS_KEY);
  },
};
