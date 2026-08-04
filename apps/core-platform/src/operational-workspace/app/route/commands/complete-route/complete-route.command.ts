import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class CompleteRouteCommand {
  constructor(
    readonly routeId: string,
    readonly identity: Identity,
  ) {}
}
