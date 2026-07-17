import { createBrowserRouter } from "react-router-dom";
import { DataRoomPage, DataRoomsPage } from "@/features/datarooms";
import { FolderPage } from "@/features/folders";

export const routes = createBrowserRouter([
  { path: "/", element: <DataRoomsPage /> },
  { path: "/datarooms/:id", element: <DataRoomPage /> },
  { path: "/datarooms/:id/folders/:folderId", element: <FolderPage /> },
  { path: "*", element: <DataRoomsPage /> },
]);
