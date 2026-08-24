import type { ShipmentDetailsInput } from "../../models/shipment-details.input.js";

export class CreateShipmentCommand {
  constructor(readonly details: ShipmentDetailsInput) {}
}
