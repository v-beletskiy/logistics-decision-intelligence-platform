import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class CompleteDeliveryCommand {
  constructor(
    readonly shipmentId: string,
    readonly identity: Identity,
  ) {}
}
