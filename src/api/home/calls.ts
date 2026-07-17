import { getFromDatabase, setInDatabase } from "@/shared/lib/indexedDb";
import { DEFAULT_WORKSPACE_ITEMS } from "./defaults";
import type { MockWorkspaceItem } from "./types";

const delay = (ms = 450) => new Promise((resolve) => window.setTimeout(resolve, ms));
const MOCK_DATA_KEY = "workspace-items";

export const workspaceApi = {
  async getItems(): Promise<MockWorkspaceItem[]> {
    await delay();

    const storedItems = await getFromDatabase<MockWorkspaceItem[]>(MOCK_DATA_KEY);
    if (storedItems) return storedItems;

    await setInDatabase(MOCK_DATA_KEY, DEFAULT_WORKSPACE_ITEMS);
    return DEFAULT_WORKSPACE_ITEMS;
  },
};
