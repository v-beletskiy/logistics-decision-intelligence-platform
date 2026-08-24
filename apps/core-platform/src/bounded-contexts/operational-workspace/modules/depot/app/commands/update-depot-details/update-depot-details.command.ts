import type { DepotDetailsInput } from "../../models/depot-details.input.js";

export class UpdateDepotDetailsCommand {
  constructor(
    readonly depotId: string,
    readonly details: DepotDetailsInput,
  ) {}
}
