export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  previousPage: number | null;
  nextPage: number | null;
  totalPages: number;
}
