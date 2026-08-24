import { SchemaRegistry } from "@logistics-decision-intelligence/validation/json-schema";

import { JsonSchemaPipe } from "../../../../../../../shared/infra/http/json-schema.pipe.js";
import { assignmentRouteParamsSchema } from "./assignment-route-params.schema.js";
import { createAssignmentRequestSchema } from "./create-assignment.schema.js";
import { reassignDriverRequestSchema } from "./reassign-driver.schema.js";
import { reassignVehicleRequestSchema } from "./reassign-vehicle.schema.js";

export {
  assignmentRouteParamsSchema,
  createAssignmentRequestSchema,
  reassignDriverRequestSchema,
  reassignVehicleRequestSchema,
};

const assignmentSchemas = new SchemaRegistry([
  assignmentRouteParamsSchema,
  createAssignmentRequestSchema,
  reassignVehicleRequestSchema,
  reassignDriverRequestSchema,
]);

export const assignmentRouteParamsPipe = new JsonSchemaPipe(
  assignmentSchemas,
  assignmentRouteParamsSchema,
);

export const createAssignmentRequestPipe = new JsonSchemaPipe(
  assignmentSchemas,
  createAssignmentRequestSchema,
);

export const reassignVehicleRequestPipe = new JsonSchemaPipe(
  assignmentSchemas,
  reassignVehicleRequestSchema,
);

export const reassignDriverRequestPipe = new JsonSchemaPipe(
  assignmentSchemas,
  reassignDriverRequestSchema,
);
