import { Injectable } from "@nestjs/common";
import {
  type CursorPageResult,
  type PageResult,
  type PaginationResult,
} from "@logistics-decision-intelligence/querying";

import { PgDatabase } from "../../../../../../shared/infra/persistence/pg-database";
import {
  DriverReadStore,
  type DriverListItem,
  type DriverSearchCriteria,
} from "../../../../../app/driver/queries/search-drivers/driver-read-store";
import type {
  DriverCursorSearch,
  DriverPageSearch,
  DriverSearch,
} from "../../../../../app/driver/queries/search-drivers/driver-search";
import { DriverSearchCursor } from "./driver-search.cursor";
import { DriverSearchMapper } from "./mappers/driver-search.mapper";
import {
  searchDriversCursor,
  searchDriversPage,
} from "./queries/driver.search.queries";

@Injectable()
export class PgDriverReadStore extends DriverReadStore {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async search(
    criteria: DriverSearchCriteria,
    search: DriverSearch,
  ): Promise<PaginationResult<DriverListItem>> {
    return search.mode === "page"
      ? this.searchPage(criteria, search)
      : this.searchCursor(criteria, search);
  }

  private async searchPage(
    criteria: DriverSearchCriteria,
    search: DriverPageSearch,
  ): Promise<PageResult<DriverListItem>> {
    const rows = await this.database.exec(
      searchDriversPage,
      DriverSearchMapper.toPageParams(criteria, search),
    );
    const totalItems = rows[0]?.totalItems ?? 0;
    return {
      mode: "page",
      items: DriverSearchMapper.pageRowsToListItems(rows),
      page: search.page,
      pageSize: search.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / search.pageSize),
    };
  }

  private async searchCursor(
    criteria: DriverSearchCriteria,
    search: DriverCursorSearch,
  ): Promise<CursorPageResult<DriverListItem>> {
    const position = search.cursor
      ? DriverSearchCursor.decode(search.cursor, criteria, search.sort)
      : undefined;
    const rows = await this.database.exec(
      searchDriversCursor,
      DriverSearchMapper.toCursorParams(criteria, search, position),
    );
    const pageRows = rows.slice(0, search.pageSize);
    const lastReturnedRow = pageRows.at(-1);
    return {
      mode: "cursor",
      items: DriverSearchMapper.cursorRowsToListItems(pageRows),
      pageSize: search.pageSize,
      nextCursor:
        rows.length > search.pageSize && lastReturnedRow
          ? DriverSearchCursor.encode(lastReturnedRow, criteria, search.sort)
          : undefined,
    };
  }
}
