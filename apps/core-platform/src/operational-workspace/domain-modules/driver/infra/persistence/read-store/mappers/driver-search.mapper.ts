import { pageOffset } from "@logistics-decision-intelligence/querying";

import type {
  DriverCertificationListItem,
  DriverListItem,
  DriverSearchCriteria,
} from "../../../../../../app/driver/queries/search-drivers/driver-read-store";
import {
  type DriverCursorSearch,
  type DriverPageSearch,
  type DriverPageSort,
} from "../../../../../../app/driver/queries/search-drivers/driver-search";
import {
  hydratePersistenceData,
  hydrateTimestamp,
} from "../../../../../../../shared/infra/persistence/persistence-hydration";
import type {
  ISearchDriversCursorParams,
  ISearchDriversCursorResult,
  ISearchDriversPageParams,
  ISearchDriversPageResult,
} from "../queries/driver.search.queries";
import type { DriverSearchCursorPosition } from "../driver-search.cursor";

type PageSortParams = Pick<
  ISearchDriversPageParams,
  "sortBy" | "idDirection"
> &
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
    search: DriverPageSearch,
  ): ISearchDriversPageParams {
    return {
      ...criteria,
      ...DriverSearchMapper.toPageSortParams(search.sort),
      offset: pageOffset(search),
      limit: search.pageSize,
    };
  }

  static toCursorParams(
    criteria: DriverSearchCriteria,
    search: DriverCursorSearch,
    position: DriverSearchCursorPosition | undefined,
  ): ISearchDriversCursorParams {
    return {
      ...criteria,
      sortBy: search.sort.by,
      direction: search.sort.direction,
      ...DriverSearchMapper.toCursorPositionParams(position),
      limit: search.pageSize + 1,
    };
  }

  static pageRowsToListItems(
    rows: readonly ISearchDriversPageResult[],
  ): readonly DriverListItem[] {
    return rows
      .filter(DriverSearchMapper.isPageItemRow)
      .map(DriverSearchMapper.toListItem);
  }

  static cursorRowsToListItems(
    rows: readonly ISearchDriversCursorResult[],
  ): readonly DriverListItem[] {
    return rows.map(DriverSearchMapper.toListItem);
  }

  private static toPageSortParams(
    sort: DriverPageSort,
  ): PageSortParams {
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
    row: ISearchDriversPageResult,
  ): row is ISearchDriversPageResult & ISearchDriversCursorResult {
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

  private static toListItem(row: ISearchDriversCursorResult): DriverListItem {
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
        validFrom: hydrateTimestamp(certification.validFrom).toISOString(),
        validUntil: hydrateTimestamp(certification.validUntil).toISOString(),
      }),
    );
  }
}
