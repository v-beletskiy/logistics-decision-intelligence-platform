import type { ShipmentDetailsInput } from "../../../app/shipment/shipment.inputs";
import {
  DimensionUnit,
  WeightUnit,
} from "../../../../shared/domain/shared-kernel/value-objects/measurement";
import type {
  CreateShipmentRequest,
  CreatedShipmentResponse,
  UpdateShipmentDetailsRequest,
} from "./shipment.http-contracts";

export class ShipmentHttpMapper {
  static toShipmentDetailsInput(
    request: CreateShipmentRequest | UpdateShipmentDetailsRequest,
  ): ShipmentDetailsInput {
    return {
      pickup: {
        address: request.pickup.address,
        location: request.pickup.location,
        timeWindow: {
          start: new Date(request.pickup.timeWindow.start),
          end: new Date(request.pickup.timeWindow.end),
        },
      },
      delivery: {
        address: request.delivery.address,
        location: request.delivery.location,
        timeWindow: {
          start: new Date(request.delivery.timeWindow.start),
          end: new Date(request.delivery.timeWindow.end),
        },
      },
      weight: {
        value: request.weight.value,
        unit: request.weight.unit as WeightUnit,
      },
      dimensions: {
        length: request.dimensions.length,
        width: request.dimensions.width,
        height: request.dimensions.height,
        unit: request.dimensions.unit as DimensionUnit,
      },
    };
  }

  static toCreatedShipmentResponse(
    shipmentId: string,
  ): CreatedShipmentResponse {
    return { id: shipmentId };
  }
}
