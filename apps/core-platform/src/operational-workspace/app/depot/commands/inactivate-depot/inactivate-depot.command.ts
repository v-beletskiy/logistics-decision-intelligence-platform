import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class InactivateDepotCommand {
  constructor(
    readonly depotId: string,
    readonly identity: Identity,
  ) {}
}
