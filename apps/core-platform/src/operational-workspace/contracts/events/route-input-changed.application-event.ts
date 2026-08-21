import type { InternalApplicationEvent } from "../../../shared/app/messaging/internal-application-event-bus";

export type RouteInputChangedApplicationEvent = InternalApplicationEvent<{
  readonly routeId: string;
  readonly tenantId: string;
}> & {
  readonly type: "operational-workspace.route.input-changed";
};

export const ROUTE_INPUT_CHANGED = "operational-workspace.route.input-changed";

export function routeInputChangedAppEvent(payload: {
  readonly routeId: string;
  readonly tenantId: string;
}): RouteInputChangedApplicationEvent {
  return { type: ROUTE_INPUT_CHANGED, payload };
}
