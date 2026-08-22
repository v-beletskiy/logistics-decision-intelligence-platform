import { SchemaRegistry } from "@logistics-decision-intelligence/validation/json-schema";

import { JsonSchemaPipe } from "../../../../../../../shared/infra/http/json-schema.pipe";
import { assignmentRouteParamsSchema } from "./assignment-route-params.schema";
import { createAssignmentRequestSchema } from "./create-assignment.schema";
import { reassignDriverRequestSchema } from "./reassign-driver.schema";
import { reassignVehicleRequestSchema } from "./reassign-vehicle.schema";

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
