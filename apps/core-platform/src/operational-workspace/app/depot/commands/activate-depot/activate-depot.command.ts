import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class ActivateDepotCommand {
  constructor(
    readonly depotId: string,
    readonly identity: Identity,
  ) {}
}
