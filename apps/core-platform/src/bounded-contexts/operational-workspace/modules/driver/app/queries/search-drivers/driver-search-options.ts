import type {
  CursorPagination,
  PagePagination,
  SortDirection,
} from "@logistics-decision-intelligence/querying";

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

export type DriverPageSearchOptions = PagePagination & {
  readonly sort: DriverPageSort;
};

export type DriverCursorSearchOptions = CursorPagination & {
  readonly sort: DriverCursorSort;
};

export type DriverSearchOptions =
  DriverPageSearchOptions | DriverCursorSearchOptions;

export const DEFAULT_DRIVER_PAGE_SORT: DriverPageSort = {
  by: "id",
  direction: "asc",
};

export const DEFAULT_DRIVER_CURSOR_SORT: DriverCursorSort = {
  by: "id",
  direction: "asc",
};
