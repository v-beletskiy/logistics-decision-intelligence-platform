import { SchemaRegistry } from "@logistics-decision-intelligence/validation/json-schema";

import { JsonSchemaPipe } from "../../../../../../../shared/infra/http/json-schema.pipe";
import {
  addressSchema,
  geoCoordinateSchema,
} from "../../../../../../../shared/infra/validation/value-objects/location";
import { createDepotRequestSchema } from "./create-depot.schema";
import { depotRouteParamsSchema } from "./shared-depots.schema";
import { updateDepotDetailsRequestSchema } from "./update-depot-details.schema";
import { updateDepotDriverCapacityRequestSchema } from "./update-driver-capacity.schema";
import { updateDepotVehicleCapacityRequestSchema } from "./update-vehicle-capacity.schema";

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
