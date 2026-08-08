import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class CloseDepotCommand {
  constructor(
    readonly depotId: string,
    readonly identity: Identity,
  ) {}
}
