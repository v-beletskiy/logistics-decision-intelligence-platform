import {
  createCursorScope,
  decodeCursor,
  encodeCursor,
} from "@logistics-decision-intelligence/querying";
import {
  isEnumValue,
  isRecord,
  isUuid,
} from "@logistics-decision-intelligence/validation";

import type { DriverSearchCriteria } from "../../../../../app/driver/queries/search-drivers/driver-read-store";
import type { DriverCursorSort } from "../../../../../app/driver/queries/search-drivers/driver-search";
import { DriverStatus } from "../../../domain/driver.aggregate";
import type { ISearchDriversCursorResult } from "./queries/driver.search.queries";

const DRIVER_SEARCH_QUERY_ID = "operational-workspace.driver.search";

export type DriverSearchCursorPosition =
  | { readonly id: string }
  | {
      readonly lastName: string;
      readonly firstName: string;
      readonly id: string;
    }
  | { readonly licenseNumber: string; readonly id: string }
  | { readonly status: DriverStatus; readonly id: string };

/** Owns the opaque cursor contract for the Driver search projection. */
export class DriverSearchCursor {
  static decode(
    cursor: string,
    criteria: DriverSearchCriteria,
    sort: DriverCursorSort,
  ): DriverSearchCursorPosition {
    return decodeCursor(
      cursor,
      DriverSearchCursor.scope(criteria, sort),
      (value) => DriverSearchCursor.parseCursorPosition(value, sort.by),
    );
  }

  static encode(
    row: ISearchDriversCursorResult,
    criteria: DriverSearchCriteria,
    sort: DriverCursorSort,
  ): string {
    return encodeCursor(
      DriverSearchCursor.scope(criteria, sort),
      DriverSearchCursor.positionFrom(row, sort.by),
    );
  }

  private static scope(
    criteria: DriverSearchCriteria,
    sort: DriverCursorSort,
  ): string {
    return createCursorScope(DRIVER_SEARCH_QUERY_ID, {
      criteria,
      sortBy: sort.by,
      direction: sort.direction,
    });
  }

  private static positionFrom(
    row: ISearchDriversCursorResult,
    sortBy: DriverCursorSort["by"],
  ): DriverSearchCursorPosition {
    switch (sortBy) {
      case "id":
        return { id: row.id };
      case "name":
        return {
          lastName: row.last_name,
          firstName: row.first_name,
          id: row.id,
        };
      case "licenseNumber":
        return { licenseNumber: row.license_number, id: row.id };
      case "status":
        return { status: row.status as DriverStatus, id: row.id };
    }
  }

  private static parseCursorPosition(
    value: unknown,
    sortBy: DriverCursorSort["by"],
  ): DriverSearchCursorPosition {
    if (!isRecord(value) || !isUuid(value.id)) {
      throw new TypeError("Driver search cursor position is invalid.");
    }
    switch (sortBy) {
      case "id":
        return { id: value.id };
      case "name":
        if (
          typeof value.lastName !== "string" ||
          typeof value.firstName !== "string"
        ) {
          throw new TypeError("Driver name cursor position is invalid.");
        }
        return {
          lastName: value.lastName,
          firstName: value.firstName,
          id: value.id,
        };
      case "licenseNumber":
        if (typeof value.licenseNumber !== "string") {
          throw new TypeError("Driver license cursor position is invalid.");
        }
        return { licenseNumber: value.licenseNumber, id: value.id };
      case "status":
        if (!isEnumValue(DriverStatus, value.status)) {
          throw new TypeError("Driver status cursor position is invalid.");
        }
        return { status: value.status, id: value.id };
    }
  }
}
