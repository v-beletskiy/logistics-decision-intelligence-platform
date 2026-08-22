import {
  defineInternalApplicationEvent,
  type InternalApplicationEventOf,
} from "../../../../shared/app/messaging/internal-application-event-bus";

export interface RouteInputChangedPayload {
  readonly routeId: string;
  readonly tenantId: string;
}

export const routeInputChanged =
  defineInternalApplicationEvent<RouteInputChangedPayload>()(
    "operational-workspace.route.input-changed",
  );

export type RouteInputChangedApplicationEvent = InternalApplicationEventOf<
  typeof routeInputChanged
>;

export const routeInputChangedAppEvent = routeInputChanged.create;
