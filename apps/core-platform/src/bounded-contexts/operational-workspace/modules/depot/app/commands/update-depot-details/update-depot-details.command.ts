import type { DepotDetailsInput } from "../../models/depot-details.input";

export class UpdateDepotDetailsCommand {
  constructor(
    readonly depotId: string,
    readonly details: DepotDetailsInput,
  ) {}
}
