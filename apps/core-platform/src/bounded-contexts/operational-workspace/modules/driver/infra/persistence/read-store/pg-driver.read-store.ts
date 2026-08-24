import { Injectable } from "@nestjs/common";
import {
  type CursorPageResult,
  type PageResult,
  type PaginationResult,
} from "@logistics-decision-intelligence/querying";

import { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database.js";
import {
  DriverReadStore,
  type DriverListItem,
  type DriverSearchCriteria,
} from "../../../app/ports/driver-read-store.js";
import type {
  DriverCursorSearchOptions,
  DriverPageSearchOptions,
  DriverSearchOptions,
} from "../../../app/queries/search-drivers/driver-search-options.js";
import { DriverSearchCursor } from "./driver-search.cursor.js";
import { DriverSearchMapper } from "./mappers/driver-search.mapper.js";
import {
  searchDriversCursor,
  searchDriversPage,
} from "./queries/driver.search.queries.js";

@Injectable()
export class PgDriverReadStore extends DriverReadStore {
  constructor(private readonly database: PgDatabase) {
    super();
  }

  async search(
    criteria: DriverSearchCriteria,
    options: DriverSearchOptions,
  ): Promise<PaginationResult<DriverListItem>> {
    return options.mode === "page"
      ? this.searchPage(criteria, options)
      : this.searchCursor(criteria, options);
  }

  private async searchPage(
    criteria: DriverSearchCriteria,
    options: DriverPageSearchOptions,
  ): Promise<PageResult<DriverListItem>> {
    const rows = await this.database.exec(
      searchDriversPage,
      DriverSearchMapper.toPageParams(criteria, options),
    );
    const totalItems = rows[0]?.totalItems ?? 0;
    return {
      mode: "page",
      items: DriverSearchMapper.pageRowsToListItems(rows),
      page: options.page,
      pageSize: options.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / options.pageSize),
    };
  }

  private async searchCursor(
    criteria: DriverSearchCriteria,
    options: DriverCursorSearchOptions,
  ): Promise<CursorPageResult<DriverListItem>> {
    const position = options.cursor
      ? DriverSearchCursor.decode(options.cursor, criteria, options.sort)
      : undefined;
    const rows = await this.database.exec(
      searchDriversCursor,
      DriverSearchMapper.toCursorParams(criteria, options, position),
    );
    const pageRows = rows.slice(0, options.pageSize);
    const lastReturnedRow = pageRows.at(-1);
    return {
      mode: "cursor",
      items: DriverSearchMapper.cursorRowsToListItems(pageRows),
      pageSize: options.pageSize,
      nextCursor:
        rows.length > options.pageSize && lastReturnedRow
          ? DriverSearchCursor.encode(lastReturnedRow, criteria, options.sort)
          : undefined,
    };
  }
}
