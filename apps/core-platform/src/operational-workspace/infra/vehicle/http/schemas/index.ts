import { SchemaRegistry } from "@logistics-decision-intelligence/validation/json-schema";

import { JsonSchemaPipe } from "../../../../../shared/infra/http/json-schema.pipe";
import { dimensionsSchema } from "../../../../../shared/infra/validation/value-objects/measurement";
import { weightSchema } from "../../../../../shared/infra/validation/value-objects/measurement";
import { addVehicleCompartmentRequestSchema } from "./add-vehicle-compartment.schema";
import { changeVehicleAvailabilityRequestSchema } from "./change-vehicle-availability.schema";
import { registerVehicleRequestSchema } from "./register-vehicle.schema";
import { updateVehicleCompartmentRequestSchema } from "./update-vehicle-compartment.schema";
import { updateVehicleDetailsRequestSchema } from "./update-vehicle-details.schema";
import { vehicleCompartmentRouteParamsSchema } from "./vehicle-compartment-route-params.schema";
import { vehicleRouteParamsSchema } from "./vehicle-route-params.schema";

export {
  addVehicleCompartmentRequestSchema,
  changeVehicleAvailabilityRequestSchema,
  registerVehicleRequestSchema,
  updateVehicleCompartmentRequestSchema,
  updateVehicleDetailsRequestSchema,
  vehicleCompartmentRouteParamsSchema,
  vehicleRouteParamsSchema,
};

const vehicleSchemas = new SchemaRegistry([
  weightSchema,
  dimensionsSchema,
  vehicleRouteParamsSchema,
  vehicleCompartmentRouteParamsSchema,
  registerVehicleRequestSchema,
  updateVehicleDetailsRequestSchema,
  changeVehicleAvailabilityRequestSchema,
  addVehicleCompartmentRequestSchema,
  updateVehicleCompartmentRequestSchema,
]);

export const vehicleRouteParamsPipe = new JsonSchemaPipe(
  vehicleSchemas,
  vehicleRouteParamsSchema,
);

export const vehicleCompartmentRouteParamsPipe = new JsonSchemaPipe(
  vehicleSchemas,
  vehicleCompartmentRouteParamsSchema,
);

export const registerVehicleRequestPipe = new JsonSchemaPipe(
  vehicleSchemas,
  registerVehicleRequestSchema,
);

export const updateVehicleDetailsRequestPipe = new JsonSchemaPipe(
  vehicleSchemas,
  updateVehicleDetailsRequestSchema,
);

export const changeVehicleAvailabilityRequestPipe = new JsonSchemaPipe(
  vehicleSchemas,
  changeVehicleAvailabilityRequestSchema,
);

export const addVehicleCompartmentRequestPipe = new JsonSchemaPipe(
  vehicleSchemas,
  addVehicleCompartmentRequestSchema,
);

export const updateVehicleCompartmentRequestPipe = new JsonSchemaPipe(
  vehicleSchemas,
  updateVehicleCompartmentRequestSchema,
);