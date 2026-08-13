import { Injectable } from "@nestjs/common";
import {
  type PaginationResult,
  validatePagination,
} from "@logistics-decision-intelligence/querying";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { DriverReadStore, type DriverListItem } from "./driver-read-store";
import {
  DEFAULT_DRIVER_CURSOR_SORT,
  DEFAULT_DRIVER_PAGE_SORT,
} from "./driver-search";
import { SearchDriversQuery } from "./search-drivers.query";

@Injectable()
export class SearchDriversHandler {
  constructor(private readonly driverReadStore: DriverReadStore) {}

  @Authorized(Permission.DriverRead)
  async exec(
    request: ExecutionRequest<SearchDriversQuery>,
  ): Promise<PaginationResult<DriverListItem>> {
    const { context, input: query } = request;
    const criteria = { tenantId: context.tenantId, ...query.filters };

    if (query.search.mode === "page") {
      return this.driverReadStore.search(criteria, {
        ...validatePagination(query.search),
        sort: query.search.sort ?? DEFAULT_DRIVER_PAGE_SORT,
      });
    }

    return this.driverReadStore.search(criteria, {
      ...validatePagination(query.search),
      sort: query.search.sort ?? DEFAULT_DRIVER_CURSOR_SORT,
    });
  }
}
