import { queryOptions, useQuery } from "@tanstack/react-query";
import { workspaceApi } from "./calls";

export const workspaceKeys = {
  all: ["workspace"] as const,
  items: () => [...workspaceKeys.all, "items"] as const,
};

const workspaceQuery = () =>
  queryOptions({
    queryKey: workspaceKeys.items(),
    queryFn: workspaceApi.getItems,
  });

export function useWorkspaceQuery() {
  return useQuery(workspaceQuery());
}
