import type { ShipmentDetails } from "../../domain-modules/shipment/domain/shipment.aggregate";

export interface ShipmentDetailsInput extends Pick<
  ShipmentDetails,
  "pickup" | "delivery" | "weight" | "dimensions"
> {}
