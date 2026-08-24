import type { ShipmentDetailsInput } from "../../models/shipment-details.input.js";

export class UpdateShipmentDetailsCommand {
  constructor(
    readonly shipmentId: string,
    readonly details: ShipmentDetailsInput,
  ) {}
}
