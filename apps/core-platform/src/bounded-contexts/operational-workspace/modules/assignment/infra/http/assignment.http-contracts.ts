import type { FromSchema } from "json-schema-to-ts";

import type {
  assignmentRouteParamsSchema,
  createAssignmentRequestSchema,
  reassignDriverRequestSchema,
  reassignVehicleRequestSchema,
} from "./schemas";

export type AssignmentRouteParams = FromSchema<
  typeof assignmentRouteParamsSchema
>;

export type CreateAssignmentRequest = FromSchema<
  typeof createAssignmentRequestSchema
>;

export type ReassignVehicleRequest = FromSchema<
  typeof reassignVehicleRequestSchema
>;

export type ReassignDriverRequest = FromSchema<
  typeof reassignDriverRequestSchema
>;

export interface CreatedAssignmentResponse {
  readonly id: string;
}
