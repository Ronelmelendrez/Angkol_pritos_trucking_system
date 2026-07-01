/**
 * Global, cross-feature types.
 * Feature-specific types live in `src/features/<feature>/types/`.
 */

/** Standard shape every mock/Supabase table row shares */
export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors the shape a Supabase query error would take, so UI error
 * handling doesn't need to change when the real client is swapped in. */
export interface ApiError {
  message: string;
  code?: string;
}

export type SortDirection = "asc" | "desc";

export interface PaginationParams {
  page: number;
  pageSize: number;
}