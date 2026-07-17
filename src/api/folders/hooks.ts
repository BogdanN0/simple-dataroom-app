import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { foldersApi } from "./calls";
import type { CreateFolderInput } from "./types";
import { dataRoomKeys } from "@/api/dataroom";

export const folderKeys = {
  all: ["folders"] as const,
  children: (dataRoomId: string, parentId: string | null) =>
    [...folderKeys.all, "children", dataRoomId, parentId] as const,
  byDataRoom: (dataRoomId: string) =>
    [...folderKeys.all, "data-room", dataRoomId] as const,
  search: (dataRoomId: string, query: string) =>
    [...folderKeys.all, "search", dataRoomId, query] as const,
  detail: (id: string) => [...folderKeys.all, "detail", id] as const,
  tree: (id: string) => [...folderKeys.all, "tree", id] as const,
  treePage: (id: string, page: number, pageSize: number, search: string) =>
    [...folderKeys.all, "tree", id, page, pageSize, search] as const,
  ancestors: (id: string) => [...folderKeys.all, "ancestors", id] as const,
  descendantSearch: (id: string, query: string) =>
    [...folderKeys.all, "descendant-search", id, query] as const,
};

export function useFoldersQuery(dataRoomId: string, parentId: string | null) {
  return useQuery({
    queryKey: folderKeys.children(dataRoomId, parentId),
    queryFn: () => foldersApi.listChildren(dataRoomId, parentId),
    enabled: Boolean(dataRoomId),
  });
}
export function useFoldersInDataRoomQuery(dataRoomId: string) {
  return useQuery({
    queryKey: folderKeys.byDataRoom(dataRoomId),
    queryFn: () => foldersApi.listByDataRoomId(dataRoomId),
    enabled: Boolean(dataRoomId),
  });
}
export function useFolderSearchQuery(dataRoomId: string, query: string) {
  return useQuery({
    queryKey: folderKeys.search(dataRoomId, query),
    queryFn: () => foldersApi.search(dataRoomId, query),
    enabled: Boolean(dataRoomId && query),
  });
}
export function useFolderQuery(id: string) {
  return useQuery({
    queryKey: folderKeys.detail(id),
    queryFn: () => foldersApi.getById(id),
    enabled: Boolean(id),
  });
}
export function useFolderTreeQuery(id: string) {
  return useQuery({
    queryKey: folderKeys.tree(id),
    queryFn: () => foldersApi.getTree(id),
    enabled: Boolean(id),
  });
}
export function useFolderTreePageQuery(
  id: string,
  page: number,
  pageSize: number,
  search: string,
) {
  return useQuery({
    queryKey: folderKeys.treePage(id, page, pageSize, search),
    queryFn: () => foldersApi.getTreePage(id, { page, pageSize }, search),
    enabled: Boolean(id),
  });
}
export function useFolderAncestorsQuery(id: string) {
  return useQuery({
    queryKey: folderKeys.ancestors(id),
    queryFn: () => foldersApi.getAncestors(id),
    enabled: Boolean(id),
  });
}
export function useDescendantFolderSearchQuery(id: string, query: string) {
  return useQuery({
    queryKey: folderKeys.descendantSearch(id, query),
    queryFn: () => foldersApi.searchDescendants(id, query),
    enabled: Boolean(id && query),
  });
}
function useFolderMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: folderKeys.all }),
        queryClient.invalidateQueries({ queryKey: dataRoomKeys.all }),
      ]);
    },
  });
}
export function useCreateFolderMutation() {
  return useFolderMutation(foldersApi.create);
}
export function useRenameFolderMutation() {
  return useFolderMutation(({ id, name }: { id: string; name: string }) =>
    foldersApi.rename(id, name),
  );
}
export function useDeleteFolderMutation() {
  return useFolderMutation(foldersApi.remove);
}
