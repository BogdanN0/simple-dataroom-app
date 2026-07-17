export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type Pagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type PaginatedResult<T> = Pagination & {
  items: T[];
};

export function paginate<T>(
  items: T[],
  params: PaginationParams = {},
): PaginatedResult<T> {
  const pageSize = params.pageSize ?? 9;
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(params.page ?? 1, 1), totalPages);
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    totalItems,
    totalPages,
  };
}
