import type { FromSchema } from "json-schema-to-ts";

import type {
  createRouteRequestSchema,
  recordRouteStopArrivalRequestSchema,
  recordRouteStopDepartureRequestSchema,
  routeRouteParamsSchema,
  routeStopRouteParamsSchema,
} from "./schemas";

export type RouteRouteParams = FromSchema<typeof routeRouteParamsSchema>;

export type RouteStopRouteParams = FromSchema<
  typeof routeStopRouteParamsSchema
>;

export type CreateRouteRequest = FromSchema<typeof createRouteRequestSchema>;

export type RecordRouteStopArrivalRequest = FromSchema<
  typeof recordRouteStopArrivalRequestSchema
>;

export type RecordRouteStopDepartureRequest = FromSchema<
  typeof recordRouteStopDepartureRequestSchema
>;

export interface CreatedRouteResponse {
  readonly id: string;
}
