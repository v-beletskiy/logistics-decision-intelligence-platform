import { SchemaRegistry } from "@logistics-decision-intelligence/validation/json-schema";

import { JsonSchemaPipe } from "../../../../../shared/infra/http/json-schema.pipe";
import { changeDriverAvailabilityRequestSchema } from "./change-driver-availability.schema";
import { registerDriverRequestSchema } from "./register-driver.schema";
import { searchDriversRequestSchema } from "./search-drivers.schema";
import {
  driverCertificationRequestSchema,
  driverCertificationRouteParamsSchema,
  driverRouteParamsSchema,
} from "./shared-drivers.schema";
import { updateDriverRequestSchema } from "./update-driver-details.schema";

export {
  changeDriverAvailabilityRequestSchema,
  registerDriverRequestSchema,
  searchDriversRequestSchema,
  driverCertificationRequestSchema,
  driverCertificationRouteParamsSchema,
  driverRouteParamsSchema,
  updateDriverRequestSchema,
};

const driverSchemas = new SchemaRegistry([
  driverRouteParamsSchema,
  driverCertificationRouteParamsSchema,
  driverCertificationRequestSchema,
  registerDriverRequestSchema,
  updateDriverRequestSchema,
  changeDriverAvailabilityRequestSchema,
]);

const driverSearchSchemas = new SchemaRegistry([searchDriversRequestSchema], {
  coerceTypes: true,
});

export const driverRouteParamsPipe = new JsonSchemaPipe(
  driverSchemas,
  driverRouteParamsSchema,
);

export const driverCertificationRouteParamsPipe = new JsonSchemaPipe(
  driverSchemas,
  driverCertificationRouteParamsSchema,
);

export const registerDriverRequestPipe = new JsonSchemaPipe(
  driverSchemas,
  registerDriverRequestSchema,
);

export const updateDriverRequestPipe = new JsonSchemaPipe(
  driverSchemas,
  updateDriverRequestSchema,
);

export const changeDriverAvailabilityRequestPipe = new JsonSchemaPipe(
  driverSchemas,
  changeDriverAvailabilityRequestSchema,
);

export const driverCertificationRequestPipe = new JsonSchemaPipe(
  driverSchemas,
  driverCertificationRequestSchema,
);

export const searchDriversRequestPipe = new JsonSchemaPipe(
  driverSearchSchemas,
  searchDriversRequestSchema,
);
