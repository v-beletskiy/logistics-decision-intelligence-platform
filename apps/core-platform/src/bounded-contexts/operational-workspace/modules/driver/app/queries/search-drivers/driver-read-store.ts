import type { PaginationResult } from "@logistics-decision-intelligence/querying";
import type { DriverStatus } from "../../../domain/driver.aggregate";
import type { DriverSearch } from "./driver-search";

export interface DriverCertificationListItem {
  readonly id: string;
  readonly type: string;
  readonly credentialNumber: string;
  readonly validFrom: string;
  readonly validUntil: string;
}

export interface DriverListItem {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly licenseNumber: string;
  readonly depotId?: string;
  readonly phoneNumber?: string;
  readonly status: DriverStatus;
  readonly certifications: readonly DriverCertificationListItem[];
}

export interface DriverSearchCriteria {
  readonly tenantId: string;
  readonly status?: DriverStatus;
  readonly depotId?: string;
  readonly lastNamePrefix?: string;
  readonly certificationType?: string;
}

export abstract class DriverReadStore {
  abstract search(
    criteria: DriverSearchCriteria,
    search: DriverSearch,
  ): Promise<PaginationResult<DriverListItem>>;
}
