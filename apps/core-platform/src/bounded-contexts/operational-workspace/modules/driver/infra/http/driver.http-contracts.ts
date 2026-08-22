import type { FromSchema } from "json-schema-to-ts";

import type { DriverStatus } from "../../domain/driver.aggregate";
import type {
  changeDriverAvailabilityRequestSchema,
  driverCertificationRequestSchema,
  driverCertificationRouteParamsSchema,
  driverRouteParamsSchema,
  registerDriverRequestSchema,
  searchDriversRequestSchema,
  updateDriverRequestSchema,
} from "./schemas";

export type DriverRouteParams = FromSchema<typeof driverRouteParamsSchema>;

export type DriverCertificationRouteParams = FromSchema<
  typeof driverCertificationRouteParamsSchema
>;

// Register driver
export type DriverCertificationRequest = FromSchema<
  typeof driverCertificationRequestSchema
>;

export type RegisterDriverRequest = FromSchema<
  typeof registerDriverRequestSchema,
  { references: [typeof driverCertificationRequestSchema] }
>;

export interface CreatedDriverResponse {
  readonly id: string;
}

// Update driver details
export type DriverDetailsRequest = FromSchema<typeof updateDriverRequestSchema>;

export type UpdateDriverRequest = DriverDetailsRequest;

// Change availability
export type ChangeDriverAvailabilityRequest = FromSchema<
  typeof changeDriverAvailabilityRequestSchema
>;

// Manage certifications
export interface CreatedDriverCertificationResponse {
  readonly id: string;
}

export interface DriverCertificationResponse {
  readonly id: string;
  readonly type: string;
  readonly credentialNumber: string;
  readonly validFrom: string;
  readonly validUntil: string;
}

// Search drivers
export type SearchDriversRequest = FromSchema<
  typeof searchDriversRequestSchema
>;

export interface DriverResponse {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly licenseNumber: string;
  readonly depotId?: string;
  readonly phoneNumber?: string;
  readonly status: DriverStatus;
  readonly certifications: readonly DriverCertificationResponse[];
}

export interface DriverPageResponse {
  readonly mode: "page";
  readonly items: readonly DriverResponse[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

export interface DriverCursorPageResponse {
  readonly mode: "cursor";
  readonly items: readonly DriverResponse[];
  readonly pageSize: number;
  readonly nextCursor?: string;
}

export type SearchDriversResponse =
  DriverPageResponse | DriverCursorPageResponse;
