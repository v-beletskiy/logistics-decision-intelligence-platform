import type { ShipmentDetails } from "../../../../domain-modules/shipment/domain/shipment.aggregate";

export class UpdateShipmentDetailsCommand {
  constructor(
    readonly shipmentId: string,
    readonly details: ShipmentDetails,
  ) {}
}
