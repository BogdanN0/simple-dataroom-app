# Data Room App

A browser-based data room for organizing confidential PDFs into data rooms and nested folders. Data is stored locally in the browser, so the app can be used and tested without a backend service.

## Setup

Prerequisites: Node.js 18 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

Other useful commands:

```bash
npm run build
npm run preview
```

The production build is written to `dist/`.

## How to use it

1. Create a data room from the home page.
2. Add folders and upload PDF files.
3. Open folders to create a nested structure.
4. Search within a data room or folder, rename items, download PDFs, or delete content.
5. When a list contains more than nine items, use the pagination controls to move between pages.
6. To inspect stored data, open Chrome DevTools and go to **Application → IndexedDB**.

The application uses IndexedDB. Browser data persists across refreshes, but clearing the site’s browser storage removes it.

## Design decisions

### 1. Data rooms are separate from folders and files

A data room represents a distinct secure workspace, such as a transaction, client, project, or due-diligence process. Folders only describe structure inside that workspace, while files are the individual documents. This separation makes the first decision clear for users: choose the workspace first, then organize its contents. It also prevents unrelated documents from being mixed in one large folder tree and leaves room for future room-level permissions, sharing, and audit history.

### 2. React Query manages server-like state

React Query is used for data rooms, folders, files, loading states, errors, mutations, and cache invalidation. This app’s important state is asynchronous persisted data rather than global UI state. React Query therefore provides query caching, refetching, mutation status, and cache updates with substantially less custom code than Redux. Local UI concerns—open dialogs, input values, selected files, and the current page—remain simple component state with `useState`.

### 3. Feature-based folder structure

The source code is organized around product features, such as `features/datarooms` and `features/folders`, instead of grouping every component, hook, and page by technical type. Each feature keeps its related UI close together, making the code easier to navigate and change. Cross-feature building blocks live in `shared`, while API modules are separated by domain in `api`.

### 4. IndexedDB instead of static JSON

IndexedDB provides persistent, browser-local storage that behaves more like a real application data source than a fixed JSON file. Every browser user can create and manage an independent set of data rooms and uploaded PDFs, including while the app is deployed as a static site. This makes realistic usage and public testing possible without accounts, a database server, or shared test data. It also supports storing file blobs, which static JSON cannot do well.

### 5. API-shaped client data layer

Even though storage is currently local, data access is exposed through domain APIs and React Query hooks rather than being called directly from pages. This keeps pages focused on the user experience and gives the app clear boundaries for create, search, rename, delete, and pagination operations. Replacing IndexedDB with HTTP endpoints later would mostly be an API-layer change, not a page-by-page rewrite.

### 6. Shared UI for repeated content workflows

Repeated controls, including the content header, creation actions, item actions, management dialogs, and pagination, are shared UI components. This keeps data-room and folder behavior visually and functionally consistent, avoids duplicate fixes, and makes future changes to these common workflows safer.

### 7. Simple API-backed pagination

Listing pages use page-based pagination with a small fixed page size. The API layer returns pagination metadata alongside each page, so UI controls are based on the actual result set rather than slicing only in the page component. Search results use the same pagination flow, which keeps the interaction predictable as the amount of content grows.

### 8. Names are unique within a folder, not across a data room

Files and folders with the same name are allowed when they are in different folders. This matches how people organize real documents: several workstreams may each contain a document named `NDA.pdf`, `Overview.pdf`, or `Notes`. Restricting uniqueness to the current parent folder prevents accidental duplicates in one location while preserving a natural, flexible folder structure.
