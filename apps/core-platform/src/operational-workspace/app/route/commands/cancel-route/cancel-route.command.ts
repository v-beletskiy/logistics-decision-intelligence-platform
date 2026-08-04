import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class CancelRouteCommand {
  constructor(
    readonly routeId: string,
    readonly identity: Identity,
  ) {}
}
