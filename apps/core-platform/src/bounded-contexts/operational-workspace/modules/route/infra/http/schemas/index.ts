import { SchemaRegistry } from "@logistics-decision-intelligence/validation/json-schema";

import { JsonSchemaPipe } from "../../../../../../../shared/infra/http/json-schema.pipe.js";
import { createRouteRequestSchema } from "./create-route.schema.js";
import { recordRouteStopArrivalRequestSchema } from "./record-route-stop-arrival.schema.js";
import { recordRouteStopDepartureRequestSchema } from "./record-route-stop-departure.schema.js";
import { routeRouteParamsSchema } from "./route-route-params.schema.js";
import { routeStopRouteParamsSchema } from "./route-stop-route-params.schema.js";

export {
  createRouteRequestSchema,
  recordRouteStopArrivalRequestSchema,
  recordRouteStopDepartureRequestSchema,
  routeRouteParamsSchema,
  routeStopRouteParamsSchema,
};

const routeSchemas = new SchemaRegistry([
  routeRouteParamsSchema,
  routeStopRouteParamsSchema,
  createRouteRequestSchema,
  recordRouteStopArrivalRequestSchema,
  recordRouteStopDepartureRequestSchema,
]);

export const routeRouteParamsPipe = new JsonSchemaPipe(
  routeSchemas,
  routeRouteParamsSchema,
);

export const routeStopRouteParamsPipe = new JsonSchemaPipe(
  routeSchemas,
  routeStopRouteParamsSchema,
);

export const createRouteRequestPipe = new JsonSchemaPipe(
  routeSchemas,
  createRouteRequestSchema,
);

export const recordRouteStopArrivalRequestPipe = new JsonSchemaPipe(
  routeSchemas,
  recordRouteStopArrivalRequestSchema,
);

export const recordRouteStopDepartureRequestPipe = new JsonSchemaPipe(
  routeSchemas,
  recordRouteStopDepartureRequestSchema,
);
