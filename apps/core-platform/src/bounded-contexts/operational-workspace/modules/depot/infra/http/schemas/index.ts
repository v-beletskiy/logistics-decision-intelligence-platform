import { SchemaRegistry } from "@logistics-decision-intelligence/validation/json-schema";

import { JsonSchemaPipe } from "../../../../../../../shared/infra/http/json-schema.pipe.js";
import {
  addressSchema,
  geoCoordinateSchema,
} from "../../../../../../../shared/infra/validation/value-objects/location/index.js";
import { createDepotRequestSchema } from "./create-depot.schema.js";
import { depotRouteParamsSchema } from "./shared-depots.schema.js";
import { updateDepotDetailsRequestSchema } from "./update-depot-details.schema.js";
import { updateDepotDriverCapacityRequestSchema } from "./update-driver-capacity.schema.js";
import { updateDepotVehicleCapacityRequestSchema } from "./update-vehicle-capacity.schema.js";

export {
  createDepotRequestSchema,
  depotRouteParamsSchema,
  updateDepotDetailsRequestSchema,
  updateDepotDriverCapacityRequestSchema,
  updateDepotVehicleCapacityRequestSchema,
};

const depotSchemas = new SchemaRegistry([
  addressSchema,
  geoCoordinateSchema,
  depotRouteParamsSchema,
  createDepotRequestSchema,
  updateDepotDetailsRequestSchema,
  updateDepotVehicleCapacityRequestSchema,
  updateDepotDriverCapacityRequestSchema,
]);

export const depotRouteParamsPipe = new JsonSchemaPipe(
  depotSchemas,
  depotRouteParamsSchema,
);

export const createDepotRequestPipe = new JsonSchemaPipe(
  depotSchemas,
  createDepotRequestSchema,
);

export const updateDepotDetailsRequestPipe = new JsonSchemaPipe(
  depotSchemas,
  updateDepotDetailsRequestSchema,
);

export const updateDepotVehicleCapacityRequestPipe = new JsonSchemaPipe(
  depotSchemas,
  updateDepotVehicleCapacityRequestSchema,
);

export const updateDepotDriverCapacityRequestPipe = new JsonSchemaPipe(
  depotSchemas,
  updateDepotDriverCapacityRequestSchema,
);
