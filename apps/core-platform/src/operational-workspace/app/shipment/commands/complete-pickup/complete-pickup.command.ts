import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class CompletePickupCommand {
  constructor(
    readonly shipmentId: string,
    readonly identity: Identity,
  ) {}
}
