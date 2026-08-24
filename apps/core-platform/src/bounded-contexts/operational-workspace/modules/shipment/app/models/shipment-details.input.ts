import type {
  DimensionsProps,
  WeightProps,
} from "../../../../../../shared/domain/value-objects/measurement/index.js";
import type { ShipmentEndpointProps } from "../../domain/shipment-endpoint.value-object.js";

/** Transport-independent input shared by create and replace-details use cases. */
export interface ShipmentDetailsInput {
  readonly pickup: ShipmentEndpointProps;
  readonly delivery: ShipmentEndpointProps;
  readonly weight: WeightProps;
  readonly dimensions: DimensionsProps;
}
