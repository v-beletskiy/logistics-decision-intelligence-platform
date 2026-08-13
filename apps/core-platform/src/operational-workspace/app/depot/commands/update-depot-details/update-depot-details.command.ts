import type { DepotDetailsInput } from "../../depot.inputs";

export class UpdateDepotDetailsCommand {
  constructor(
    readonly depotId: string,
    readonly details: DepotDetailsInput,
  ) {}
}
