import { hydratePersistenceData } from "../../../../../../../shared/infra/persistence/persistence-hydration";
import {
  Shipment,
  ShipmentStatus,
  type ShipmentProps,
} from "../../../../domain/shipment.aggregate";
import { ShipmentEndpoint } from "../../../../domain/shipment-endpoint.value-object";
import { ShipmentId } from "../../../../domain/shipment-id";
import {
  Dimensions,
  type DimensionsProps,
  Weight,
  type WeightProps,
} from "../../../../../../../shared/domain/shared-kernel/value-objects/measurement";
import type { AddressProps } from "../../../../../../../shared/domain/shared-kernel/value-objects/location/address";
import type { GeoCoordinateProps } from "../../../../../../../shared/domain/shared-kernel/value-objects/location/geo-coordinate";
import type { IInsertShipmentParams } from "../queries/shipment.insert.queries";

export interface ShipmentPersistenceRow {
  readonly id: string;
  readonly status: string;
  readonly pickup_completed: boolean;
  readonly delivery_completed: boolean;
  readonly pickup_country: string;
  readonly pickup_state_or_region: string | null;
  readonly pickup_city: string;
  readonly pickup_street: string;
  readonly pickup_building_number: string;
  readonly pickup_postal_code: string;
  readonly pickup_latitude: number;
  readonly pickup_longitude: number;
  readonly pickup_start_at: Date;
  readonly pickup_end_at: Date;
  readonly delivery_country: string;
  readonly delivery_state_or_region: string | null;
  readonly delivery_city: string;
  readonly delivery_street: string;
  readonly delivery_building_number: string;
  readonly delivery_postal_code: string;
  readonly delivery_latitude: number;
  readonly delivery_longitude: number;
  readonly delivery_start_at: Date;
  readonly delivery_end_at: Date;
  readonly weight_value: number;
  readonly weight_unit: string;
  readonly length: number;
  readonly width: number;
  readonly height: number;
  readonly dimension_unit: string;
}

/** Maps a Shipment aggregate to and from its persistence representation. */
export class ShipmentMapper {
  static toDomain(row: ShipmentPersistenceRow): Shipment {
    return hydratePersistenceData("shipment", () => {
      const props: ShipmentProps = {
        pickup: ShipmentEndpoint.create({
          address: endpointAddress(row, "pickup"),
          location: endpointLocation(row, "pickup"),
          timeWindow: { start: row.pickup_start_at, end: row.pickup_end_at },
        }),
        delivery: ShipmentEndpoint.create({
          address: endpointAddress(row, "delivery"),
          location: endpointLocation(row, "delivery"),
          timeWindow: {
            start: row.delivery_start_at,
            end: row.delivery_end_at,
          },
        }),
        weight: Weight.create({
          value: row.weight_value,
          unit: row.weight_unit as WeightProps["unit"],
        } satisfies WeightProps),
        dimensions: Dimensions.create({
          length: row.length,
          width: row.width,
          height: row.height,
          unit: row.dimension_unit as DimensionsProps["unit"],
        } satisfies DimensionsProps),
        pickupCompleted: row.pickup_completed,
        deliveryCompleted: row.delivery_completed,
        status: row.status as ShipmentStatus,
      };
      return Shipment.reconstitute(ShipmentId.from(row.id), props);
    });
  }

  static toPersistence(
    tenantId: string,
    shipment: Shipment,
  ): IInsertShipmentParams {
    return {
      tenantId,
      id: shipment.id.value,
      status: shipment.status,
      pickupCompleted: shipment.pickupCompleted,
      deliveryCompleted: shipment.deliveryCompleted,
      pickupCountry: shipment.pickup.address.country,
      pickupStateOrRegion: shipment.pickup.address.stateOrRegion,
      pickupCity: shipment.pickup.address.city,
      pickupStreet: shipment.pickup.address.street,
      pickupBuildingNumber: shipment.pickup.address.buildingNumber,
      pickupPostalCode: shipment.pickup.address.postalCode,
      pickupLatitude: shipment.pickup.location.latitude,
      pickupLongitude: shipment.pickup.location.longitude,
      pickupStartAt: shipment.pickup.timeWindow.start,
      pickupEndAt: shipment.pickup.timeWindow.end,
      deliveryCountry: shipment.delivery.address.country,
      deliveryStateOrRegion: shipment.delivery.address.stateOrRegion,
      deliveryCity: shipment.delivery.address.city,
      deliveryStreet: shipment.delivery.address.street,
      deliveryBuildingNumber: shipment.delivery.address.buildingNumber,
      deliveryPostalCode: shipment.delivery.address.postalCode,
      deliveryLatitude: shipment.delivery.location.latitude,
      deliveryLongitude: shipment.delivery.location.longitude,
      deliveryStartAt: shipment.delivery.timeWindow.start,
      deliveryEndAt: shipment.delivery.timeWindow.end,
      weightValue: shipment.weight.value,
      weightUnit: shipment.weight.unit,
      length: shipment.dimensions.length,
      width: shipment.dimensions.width,
      height: shipment.dimensions.height,
      dimensionUnit: shipment.dimensions.unit,
    };
  }
}

function endpointAddress(
  row: ShipmentPersistenceRow,
  endpoint: "pickup" | "delivery",
): AddressProps {
  const prefix = endpoint === "pickup" ? "pickup" : "delivery";
  return {
    country: row[`${prefix}_country`],
    stateOrRegion: row[`${prefix}_state_or_region`] ?? undefined,
    city: row[`${prefix}_city`],
    street: row[`${prefix}_street`],
    buildingNumber: row[`${prefix}_building_number`],
    postalCode: row[`${prefix}_postal_code`],
  } satisfies AddressProps;
}

function endpointLocation(
  row: ShipmentPersistenceRow,
  endpoint: "pickup" | "delivery",
): GeoCoordinateProps {
  const prefix = endpoint === "pickup" ? "pickup" : "delivery";
  return {
    latitude: row[`${prefix}_latitude`],
    longitude: row[`${prefix}_longitude`],
  } satisfies GeoCoordinateProps;
}
