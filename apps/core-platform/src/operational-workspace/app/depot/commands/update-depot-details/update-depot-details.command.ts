import type { DepotDetails } from "../../../../domain-modules/depot/domain/depot.aggregate";
import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class UpdateDepotDetailsCommand {
  constructor(
    readonly depotId: string,
    readonly details: DepotDetails,
    readonly identity: Identity,
  ) {}
}
