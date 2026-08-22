import type {
  CursorPagination,
  CursorPaginationInput,
  PagePagination,
  PagePaginationInput,
  SortDirection,
} from "@logistics-decision-intelligence/querying";

import type { DriverStatus } from "../../../domain/driver.aggregate";

export interface DriverSearchFilters {
  readonly status?: DriverStatus;
  readonly depotId?: string;
  readonly lastNamePrefix?: string;
  readonly certificationType?: string;
}

export type DriverPageSort =
  | {
      readonly by: "id";
      readonly direction: SortDirection;
    }
  | {
      readonly by: "name";
      readonly lastNameDirection: SortDirection;
      readonly firstNameDirection: SortDirection;
    }
  | {
      readonly by: "licenseNumber";
      readonly direction: SortDirection;
    }
  | {
      readonly by: "status";
      readonly direction: SortDirection;
    };

export interface DriverCursorSort {
  readonly by: "id" | "name" | "licenseNumber" | "status";
  readonly direction: SortDirection;
}

export type DriverSearchInput =
  | (PagePaginationInput & { readonly sort?: DriverPageSort })
  | (CursorPaginationInput & { readonly sort?: DriverCursorSort });

export type DriverPageSearch = PagePagination & {
  readonly sort: DriverPageSort;
};

export type DriverCursorSearch = CursorPagination & {
  readonly sort: DriverCursorSort;
};

export type DriverSearch = DriverPageSearch | DriverCursorSearch;

export const DEFAULT_DRIVER_PAGE_SORT: DriverPageSort = {
  by: "id",
  direction: "asc",
};

export const DEFAULT_DRIVER_CURSOR_SORT: DriverCursorSort = {
  by: "id",
  direction: "asc",
};
