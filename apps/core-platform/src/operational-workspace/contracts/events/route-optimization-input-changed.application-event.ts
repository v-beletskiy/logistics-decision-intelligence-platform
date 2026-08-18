import type { InternalApplicationEvent } from "../../../shared/app/messaging/internal-application-event-bus";

export type RouteOptimizationInputChangedApplicationEvent =
  InternalApplicationEvent<{
    readonly routeId: string;
    readonly tenantId: string;
  }> & {
    readonly type: "RouteOptimizationInputChanged";
  };

export const ROUTE_OPTIMIZATION_INPUT_CHANGED = "RouteOptimizationInputChanged";

export function routeOptimizationInputChangedAppEvent(payload: {
  readonly routeId: string;
  readonly tenantId: string;
}): RouteOptimizationInputChangedApplicationEvent {
  return { type: ROUTE_OPTIMIZATION_INPUT_CHANGED, payload };
}
