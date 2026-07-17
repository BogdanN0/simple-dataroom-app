import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { filesApi } from "./calls";
import type { DataRoomFile, UploadFileInput } from "./types";
import { dataRoomKeys } from "@/api/dataroom";
import { folderKeys } from "@/api/folders";

export const fileKeys = {
  all: ["files"] as const,
  children: (dataRoomId: string, parentId: string | null) =>
    [...fileKeys.all, "children", dataRoomId, parentId] as const,
  search: (dataRoomId: string, query: string) =>
    [...fileKeys.all, "search", dataRoomId, query] as const,
  descendantSearch: (folderId: string, query: string) =>
    [...fileKeys.all, "descendant-search", folderId, query] as const,
};
export function useFilesQuery(dataRoomId: string, parentId: string | null) {
  return useQuery({
    queryKey: fileKeys.children(dataRoomId, parentId),
    queryFn: () => filesApi.listChildren(dataRoomId, parentId),
    enabled: Boolean(dataRoomId),
  });
}
export function useFileSearchQuery(dataRoomId: string, query: string) {
  return useQuery({
    queryKey: fileKeys.search(dataRoomId, query),
    queryFn: () => filesApi.search(dataRoomId, query),
    enabled: Boolean(dataRoomId && query),
  });
}
export function useDescendantFileSearchQuery(folderId: string, query: string) {
  return useQuery({
    queryKey: fileKeys.descendantSearch(folderId, query),
    queryFn: () => filesApi.searchDescendants(folderId, query),
    enabled: Boolean(folderId && query),
  });
}
function useFileMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: fileKeys.all }),
        client.invalidateQueries({ queryKey: folderKeys.all }),
        client.invalidateQueries({ queryKey: dataRoomKeys.all }),
      ]);
    },
  });
}
export function useUploadFileMutation() {
  return useFileMutation<DataRoomFile, UploadFileInput>(filesApi.upload);
}
export function useRenameFileMutation() {
  return useFileMutation(({ id, name }: { id: string; name: string }) =>
    filesApi.rename(id, name),
  );
}
export function useDeleteFileMutation() {
  return useFileMutation(filesApi.remove);
}
