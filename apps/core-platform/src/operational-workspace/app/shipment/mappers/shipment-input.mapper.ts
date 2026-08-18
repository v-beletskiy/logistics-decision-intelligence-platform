import type { ShipmentDetails } from "../../../domain-modules/shipment/domain/shipment.aggregate";
import type { ShipmentDetailsInput } from "../shipment.inputs";

export class ShipmentInputMapper {
  static toDetails(input: ShipmentDetailsInput): ShipmentDetails {
    return {
      pickup: input.pickup,
      delivery: input.delivery,
      weight: input.weight,
      dimensions: input.dimensions,
    };
  }
}
