import type { SortDirection } from "@logistics-decision-intelligence/querying";

import type { DriverStatus } from "../../../../domain-modules/driver/domain/driver.aggregate";

export interface SearchDriversQueryInput {
  readonly mode: "page" | "cursor";
  readonly page?: number;
  readonly pageSize?: number;
  readonly cursor?: string;
  readonly status?: DriverStatus;
  readonly depotId?: string;
  readonly lastNamePrefix?: string;
  readonly certificationType?: string;
  readonly sortBy?: "id" | "name" | "licenseNumber" | "status";
  readonly direction?: SortDirection;
}

export class SearchDriversQuery {
  constructor(readonly input: SearchDriversQueryInput) {}
}
