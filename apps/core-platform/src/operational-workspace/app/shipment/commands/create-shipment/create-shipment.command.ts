import type { ShipmentDetails } from "../../../../domain-modules/shipment/domain/shipment.aggregate";

export class CreateShipmentCommand {
  constructor(
    readonly details: ShipmentDetails,
  ) {}
}
