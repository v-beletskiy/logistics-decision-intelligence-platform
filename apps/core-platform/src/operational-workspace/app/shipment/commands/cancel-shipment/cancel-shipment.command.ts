import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class CancelShipmentCommand {
  constructor(
    readonly shipmentId: string,
    readonly identity: Identity,
  ) {}
}
