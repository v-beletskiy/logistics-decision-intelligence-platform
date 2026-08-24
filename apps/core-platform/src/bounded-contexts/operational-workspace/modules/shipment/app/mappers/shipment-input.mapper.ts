import type { ShipmentDetails } from "../../domain/shipment.aggregate.js";
import type { ShipmentDetailsInput } from "../models/shipment-details.input.js";

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
