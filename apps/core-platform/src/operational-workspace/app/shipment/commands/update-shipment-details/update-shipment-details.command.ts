import type { ShipmentDetailsInput } from "../../shipment.inputs";

export class UpdateShipmentDetailsCommand {
  constructor(
    readonly shipmentId: string,
    readonly details: ShipmentDetailsInput,
  ) {}
}
