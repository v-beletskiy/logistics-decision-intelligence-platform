import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class StartRouteCommand {
  constructor(
    readonly routeId: string,
    readonly identity: Identity,
  ) {}
}
