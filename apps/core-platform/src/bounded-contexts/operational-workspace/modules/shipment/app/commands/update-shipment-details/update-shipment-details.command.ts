import type { ShipmentDetailsInput } from "../../models/shipment-details.input";

export class UpdateShipmentDetailsCommand {
  constructor(
    readonly shipmentId: string,
    readonly details: ShipmentDetailsInput,
  ) {}
}
