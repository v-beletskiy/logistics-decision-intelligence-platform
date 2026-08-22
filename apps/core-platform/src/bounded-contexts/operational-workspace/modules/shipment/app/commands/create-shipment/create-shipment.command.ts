import type { ShipmentDetailsInput } from "../../models/shipment-details.input";

export class CreateShipmentCommand {
  constructor(readonly details: ShipmentDetailsInput) {}
}
