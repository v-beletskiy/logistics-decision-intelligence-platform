import type { RouteStopDetails } from "../../../../domain-modules/route/domain/route-stop.entity";

export class CreateRouteCommand {
  constructor(
    readonly stops: readonly RouteStopDetails[],
    readonly initiatedByUserId?: string,
  ) {}
}
