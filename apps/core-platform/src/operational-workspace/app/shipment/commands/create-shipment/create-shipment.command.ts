import type { ShipmentDetailsInput } from "../../shipment.inputs";

export class CreateShipmentCommand {
  constructor(
    readonly details: ShipmentDetailsInput,
  ) {}
}
