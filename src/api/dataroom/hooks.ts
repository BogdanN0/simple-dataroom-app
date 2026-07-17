import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateResourceInput } from "@/shared/models/creation";
import { dataRoomsApi } from "./calls";
import type { DataRoom } from "./types";

export const dataRoomKeys = {
  all: ["datarooms"] as const,
  list: () => [...dataRoomKeys.all, "list"] as const,
  tree: (id: string) => [...dataRoomKeys.all, "tree", id] as const,
  listPage: (page: number, pageSize: number) =>
    [...dataRoomKeys.all, "list", page, pageSize] as const,
  treePage: (id: string, page: number, pageSize: number, search: string) =>
    [...dataRoomKeys.all, "tree", id, page, pageSize, search] as const,
};

export function useDataRoomsQuery() {
  return useQuery({
    queryKey: dataRoomKeys.list(),
    queryFn: dataRoomsApi.list,
  });
}

export function useDataRoomsPageQuery(page: number, pageSize: number) {
  return useQuery({
    queryKey: dataRoomKeys.listPage(page, pageSize),
    queryFn: () => dataRoomsApi.listPage({ page, pageSize }),
  });
}

export function useDataRoomTreeQuery(id: string) {
  return useQuery({
    queryKey: dataRoomKeys.tree(id),
    queryFn: () => dataRoomsApi.getTree(id),
  });
}

export function useDataRoomTreePageQuery(
  id: string,
  page: number,
  pageSize: number,
  search: string,
) {
  return useQuery({
    queryKey: dataRoomKeys.treePage(id, page, pageSize, search),
    queryFn: () => dataRoomsApi.getTreePage(id, { page, pageSize }, search),
    enabled: Boolean(id),
  });
}

function useRoomMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: dataRoomKeys.all }),
  });
}

export function useCreateDataRoomMutation() {
  return useRoomMutation<DataRoom, CreateResourceInput>(dataRoomsApi.create);
}

export function useRenameDataRoomMutation() {
  return useRoomMutation<DataRoom, { id: string; input: CreateResourceInput }>(
    ({ id, input }) => dataRoomsApi.rename(id, input),
  );
}

export function useDeleteDataRoomMutation() {
  return useRoomMutation<void, string>(dataRoomsApi.remove);
}
