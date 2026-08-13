import type { RouteStopDetails } from "../../../../domain-modules/route/domain/route-stop.aggregate";

export class CreateRouteCommand {
  constructor(readonly stops: readonly RouteStopDetails[]) {}
}
