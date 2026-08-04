import type { RouteStopDetails } from "../../../../domain-modules/route/domain/route-stop.entity";
import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class CreateRouteCommand {
  constructor(
    readonly stops: readonly RouteStopDetails[],
    readonly tenantId: string,
    readonly identity: Identity,
    readonly initiatedByUserId?: string,
  ) {}
}
