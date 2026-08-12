import type { DepotDetails } from "../../../../domain-modules/depot/domain/depot.aggregate";

export class UpdateDepotDetailsCommand {
  constructor(
    readonly depotId: string,
    readonly details: DepotDetails,
  ) {}
}
