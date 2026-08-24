import { Injectable } from "@nestjs/common";
import {
  type PaginationResult,
  validatePagination,
} from "@logistics-decision-intelligence/querying";

import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator.js";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum.js";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import {
  DriverReadStore,
  type DriverListItem,
} from "../../ports/driver-read-store.js";
import {
  DEFAULT_DRIVER_CURSOR_SORT,
  DEFAULT_DRIVER_PAGE_SORT,
  type DriverCursorSort,
  type DriverPageSort,
} from "./driver-search-options.js";
import {
  SearchDriversQuery,
  type SearchDriversQueryInput,
} from "./search-drivers.query.js";

@Injectable()
export class SearchDriversHandler {
  constructor(private readonly driverReadStore: DriverReadStore) {}

  @Authorized(Permission.DriverRead)
  async exec(
    request: UseCaseRequest<SearchDriversQuery>,
  ): Promise<PaginationResult<DriverListItem>> {
    const { context, input: query } = request;
    const {
      mode,
      page,
      pageSize,
      cursor,
      status,
      depotId,
      lastNamePrefix,
      certificationType,
      sortBy,
      direction,
    } = query.input;
    const criteria = {
      tenantId: context.tenantId,
      status,
      depotId,
      lastNamePrefix,
      certificationType,
    };

    if (mode === "page") {
      return this.driverReadStore.search(criteria, {
        ...validatePagination({ mode, page, pageSize }),
        sort: resolvePageSort(sortBy, direction),
      });
    }

    return this.driverReadStore.search(criteria, {
      ...validatePagination({ mode, cursor, pageSize }),
      sort: resolveCursorSort(sortBy, direction),
    });
  }
}

function resolvePageSort(
  sortBy: SearchDriversQueryInput["sortBy"],
  direction: SearchDriversQueryInput["direction"],
): DriverPageSort {
  if (sortBy === undefined) return DEFAULT_DRIVER_PAGE_SORT;

  const sortDirection = direction ?? "asc";
  if (sortBy === "name") {
    return {
      by: "name",
      lastNameDirection: sortDirection,
      firstNameDirection: sortDirection,
    };
  }
  return { by: sortBy, direction: sortDirection };
}

function resolveCursorSort(
  sortBy: SearchDriversQueryInput["sortBy"],
  direction: SearchDriversQueryInput["direction"],
): DriverCursorSort {
  if (sortBy === undefined) return DEFAULT_DRIVER_CURSOR_SORT;
  return { by: sortBy, direction: direction ?? "asc" };
}
