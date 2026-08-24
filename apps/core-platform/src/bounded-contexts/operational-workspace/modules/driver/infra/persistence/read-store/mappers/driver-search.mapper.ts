import { pageOffset } from "@logistics-decision-intelligence/querying";

import type {
  DriverCertificationListItem,
  DriverListItem,
  DriverSearchCriteria,
} from "../../../../app/ports/driver-read-store.js";
import {
  type DriverCursorSearchOptions,
  type DriverPageSearchOptions,
  type DriverPageSort,
} from "../../../../app/queries/search-drivers/driver-search-options.js";
import {
  hydratePersistenceData,
  parsePersistedTimestamp,
} from "../../../../../../../../shared/infra/persistence/persistence-hydration.js";
import type {
  ISearchDriversCursorParams,
  ISearchDriversPageParams,
} from "../queries/driver.search.queries.js";
import type { DriverSearchCursorPosition } from "../driver-search.cursor.js";

interface DriverSearchRow {
  readonly id: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly license_number: string;
  readonly depot_id: string | null;
  readonly phone_number: string | null;
  readonly status: string;
  readonly certifications: unknown;
}

interface DriverSearchPageRow {
  readonly id: string | null;
  readonly first_name: string | null;
  readonly last_name: string | null;
  readonly license_number: string | null;
  readonly depot_id: string | null;
  readonly phone_number: string | null;
  readonly status: string | null;
  readonly certifications: unknown;
  readonly totalItems: number;
}

type DriverSearchPageItemRow = DriverSearchPageRow & DriverSearchRow;

type PageSortParams = Pick<ISearchDriversPageParams, "sortBy" | "idDirection"> &
  Partial<
    Pick<
      ISearchDriversPageParams,
      | "lastNameDirection"
      | "firstNameDirection"
      | "licenseNumberDirection"
      | "statusDirection"
    >
  >;

type CursorPositionParams = Pick<
  ISearchDriversCursorParams,
  | "afterId"
  | "afterLastName"
  | "afterFirstName"
  | "afterLicenseNumber"
  | "afterStatus"
>;

/** Maps the Driver search contract to and from its PostgreSQL projection. */
export class DriverSearchMapper {
  static toPageParams(
    criteria: DriverSearchCriteria,
    options: DriverPageSearchOptions,
  ): ISearchDriversPageParams {
    return {
      ...criteria,
      ...DriverSearchMapper.toPageSortParams(options.sort),
      offset: pageOffset(options),
      limit: options.pageSize,
    };
  }

  static toCursorParams(
    criteria: DriverSearchCriteria,
    options: DriverCursorSearchOptions,
    position: DriverSearchCursorPosition | undefined,
  ): ISearchDriversCursorParams {
    return {
      ...criteria,
      sortBy: options.sort.by,
      direction: options.sort.direction,
      ...DriverSearchMapper.toCursorPositionParams(position),
      limit: options.pageSize + 1,
    };
  }

  static pageRowsToListItems(
    rows: readonly DriverSearchPageRow[],
  ): readonly DriverListItem[] {
    return rows
      .filter(DriverSearchMapper.isPageItemRow)
      .map(DriverSearchMapper.toListItem);
  }

  static cursorRowsToListItems(
    rows: readonly DriverSearchRow[],
  ): readonly DriverListItem[] {
    return rows.map(DriverSearchMapper.toListItem);
  }

  private static toPageSortParams(sort: DriverPageSort): PageSortParams {
    switch (sort.by) {
      case "id":
        return { sortBy: "id", idDirection: sort.direction };
      case "name":
        return {
          sortBy: "name",
          lastNameDirection: sort.lastNameDirection,
          firstNameDirection: sort.firstNameDirection,
          idDirection: sort.firstNameDirection,
        };
      case "licenseNumber":
        return {
          sortBy: "licenseNumber",
          licenseNumberDirection: sort.direction,
          idDirection: sort.direction,
        };
      case "status":
        return {
          sortBy: "status",
          statusDirection: sort.direction,
          idDirection: sort.direction,
        };
    }
  }

  private static isPageItemRow(
    row: DriverSearchPageRow,
  ): row is DriverSearchPageItemRow {
    // The SQL emits one all-null item row only when the requested page is empty,
    // so the exact total remains available without a second count query.
    return row.id !== null;
  }

  private static toCursorPositionParams(
    position: DriverSearchCursorPosition | undefined,
  ): CursorPositionParams {
    return {
      afterId: position?.id,
      afterLastName:
        position && "lastName" in position ? position.lastName : undefined,
      afterFirstName:
        position && "firstName" in position ? position.firstName : undefined,
      afterLicenseNumber:
        position && "licenseNumber" in position
          ? position.licenseNumber
          : undefined,
      afterStatus:
        position && "status" in position ? position.status : undefined,
    };
  }

  private static toListItem(row: DriverSearchRow): DriverListItem {
    return hydratePersistenceData("driver search result", () => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      licenseNumber: row.license_number,
      depotId: row.depot_id ?? undefined,
      phoneNumber: row.phone_number ?? undefined,
      status: row.status as DriverListItem["status"],
      certifications: DriverSearchMapper.toCertificationListItems(
        row.certifications,
      ),
    }));
  }

  private static toCertificationListItems(
    value: unknown,
  ): readonly DriverCertificationListItem[] {
    return (value as readonly DriverCertificationListItem[]).map(
      (certification) => ({
        ...certification,
        validFrom: parsePersistedTimestamp(
          certification.validFrom,
        ).toISOString(),
        validUntil: parsePersistedTimestamp(
          certification.validUntil,
        ).toISOString(),
      }),
    );
  }
}
