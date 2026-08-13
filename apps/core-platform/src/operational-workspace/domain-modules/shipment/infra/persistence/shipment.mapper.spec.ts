import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { AddressProps } from "../../../../../shared/domain/shared-kernel/value-objects/location/address";
import {
  DimensionUnit,
  type DimensionsProps,
  WeightUnit,
  type WeightProps,
} from "../../../../../shared/domain/shared-kernel/value-objects/measurement";

import { Shipment, ShipmentStatus } from "../../domain/shipment.aggregate";
import { ShipmentId } from "../../domain/shipment-id";
import {
  ShipmentMapper,
  type ShipmentPersistenceRow,
} from "./shipment.mapper";

const tenantId = "00000000-0000-4000-8000-000000000099";

const pickupAddress: AddressProps = {
  country: "UA",
  stateOrRegion: "Kyiv Oblast",
  city: "Kyiv",
  street: "Dniprovska",
  buildingNumber: "12",
  postalCode: "02000",
};

const deliveryAddress: AddressProps = {
  country: "PL",
  city: "Warsaw",
  street: "Aleje Jerozolimskie",
  buildingNumber: "5",
  postalCode: "00-001",
};

const weight: WeightProps = { value: 25, unit: WeightUnit.Kilogram };
const dimensions: DimensionsProps = {
  length: 1,
  width: 0.5,
  height: 0.5,
  unit: DimensionUnit.Centimeter,
};

const shipmentDetails = {
  pickup: {
    address: pickupAddress,
    timeWindow: {
      start: new Date("2026-08-01T08:00:00Z"),
      end: new Date("2026-08-01T10:00:00Z"),
    },
  },
  delivery: {
    address: deliveryAddress,
    timeWindow: {
      start: new Date("2026-08-01T14:00:00Z"),
      end: new Date("2026-08-01T18:00:00Z"),
    },
  },
  weight,
  dimensions,
};

const shipmentEntity: ShipmentPersistenceRow = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  status: "IN_PROGRESS",
  pickup_completed: true,
  delivery_completed: false,
  pickup_country: pickupAddress.country,
  pickup_state_or_region: pickupAddress.stateOrRegion ?? null,
  pickup_city: pickupAddress.city,
  pickup_street: pickupAddress.street,
  pickup_building_number: pickupAddress.buildingNumber,
  pickup_postal_code: pickupAddress.postalCode,
  pickup_start_at: new Date("2026-08-01T08:00:00Z"),
  pickup_end_at: new Date("2026-08-01T10:00:00Z"),
  delivery_country: deliveryAddress.country,
  delivery_state_or_region: deliveryAddress.stateOrRegion ?? null,
  delivery_city: deliveryAddress.city,
  delivery_street: deliveryAddress.street,
  delivery_building_number: deliveryAddress.buildingNumber,
  delivery_postal_code: deliveryAddress.postalCode,
  delivery_start_at: new Date("2026-08-01T14:00:00Z"),
  delivery_end_at: new Date("2026-08-01T18:00:00Z"),
  weight_value: weight.value,
  weight_unit: weight.unit,
  length: dimensions.length,
  width: dimensions.width,
  height: dimensions.height,
  dimension_unit: dimensions.unit,
};

test("ShipmentMapper reconstitutes a shipment from its persisted row", () => {
  const shipment = ShipmentMapper.toDomain(shipmentEntity);

  assert.equal(shipment.id.value, shipmentEntity.id);
  assert.equal(shipment.status, ShipmentStatus.InProgress);
  assert.equal(shipment.pickupCompleted, true);
  assert.equal(shipment.deliveryCompleted, false);
  assert.equal(shipment.pickup.address.city, pickupAddress.city);
  assert.equal(
    shipment.pickup.address.stateOrRegion,
    pickupAddress.stateOrRegion,
  );
  assert.equal(
    shipment.pickup.timeWindow.start.getTime(),
    shipmentEntity.pickup_start_at.getTime(),
  );
  assert.equal(shipment.delivery.address.city, deliveryAddress.city);
  assert.equal(shipment.weight.value, weight.value);
  assert.equal(shipment.weight.unit, weight.unit);
  assert.equal(shipment.dimensions.length, dimensions.length);
  assert.equal(shipment.dimensions.unit, dimensions.unit);
});

test("ShipmentMapper maps absent nullable address columns to undefined", () => {
  const shipment = ShipmentMapper.toDomain({
    ...shipmentEntity,
    pickup_state_or_region: null,
  });

  assert.equal(shipment.pickup.address.stateOrRegion, undefined);
});

test("ShipmentMapper derives a clean write model for a loaded shipment", () => {
  const shipment = ShipmentMapper.toDomain(shipmentEntity);

  const persistence = ShipmentMapper.toPersistence(tenantId, shipment);

  assert.equal(persistence.isNew, false);
  assert.deepEqual(persistence.root, {
    tenantId,
    id: shipmentEntity.id,
    status: ShipmentStatus.InProgress,
    pickupCompleted: true,
    deliveryCompleted: false,
    pickupCountry: pickupAddress.country,
    pickupStateOrRegion: pickupAddress.stateOrRegion,
    pickupCity: pickupAddress.city,
    pickupStreet: pickupAddress.street,
    pickupBuildingNumber: pickupAddress.buildingNumber,
    pickupPostalCode: pickupAddress.postalCode,
    pickupStartAt: shipmentEntity.pickup_start_at,
    pickupEndAt: shipmentEntity.pickup_end_at,
    deliveryCountry: deliveryAddress.country,
    deliveryStateOrRegion: undefined,
    deliveryCity: deliveryAddress.city,
    deliveryStreet: deliveryAddress.street,
    deliveryBuildingNumber: deliveryAddress.buildingNumber,
    deliveryPostalCode: deliveryAddress.postalCode,
    deliveryStartAt: shipmentEntity.delivery_start_at,
    deliveryEndAt: shipmentEntity.delivery_end_at,
    weightValue: weight.value,
    weightUnit: weight.unit,
    length: dimensions.length,
    width: dimensions.width,
    height: dimensions.height,
    dimensionUnit: dimensions.unit,
  });
});

test("ShipmentMapper marks a registration as an insert", () => {
  const shipment = Shipment.create(shipmentDetails);

  const persistence = ShipmentMapper.toPersistence(tenantId, shipment);

  assert.equal(persistence.isNew, true);
  assert.equal(persistence.root.id, shipment.id.value);
  assert.equal(persistence.root.status, ShipmentStatus.Created);
  assert.equal(persistence.root.pickupCompleted, false);
  assert.equal(persistence.root.deliveryCompleted, false);
});

test("ShipmentMapper round-trips a shipment through its persisted shape", () => {
  const original = Shipment.create(shipmentDetails);
  original.completePickup();
  original.completeDelivery();

  const persistence = ShipmentMapper.toPersistence(tenantId, original);
  const entity: ShipmentPersistenceRow = {
    id: persistence.root.id,
    status: persistence.root.status,
    pickup_completed: persistence.root.pickupCompleted,
    delivery_completed: persistence.root.deliveryCompleted,
    pickup_country: persistence.root.pickupCountry,
    pickup_state_or_region: persistence.root.pickupStateOrRegion ?? null,
    pickup_city: persistence.root.pickupCity,
    pickup_street: persistence.root.pickupStreet,
    pickup_building_number: persistence.root.pickupBuildingNumber,
    pickup_postal_code: persistence.root.pickupPostalCode,
    pickup_start_at: persistence.root.pickupStartAt as Date,
    pickup_end_at: persistence.root.pickupEndAt as Date,
    delivery_country: persistence.root.deliveryCountry,
    delivery_state_or_region: persistence.root.deliveryStateOrRegion ?? null,
    delivery_city: persistence.root.deliveryCity,
    delivery_street: persistence.root.deliveryStreet,
    delivery_building_number: persistence.root.deliveryBuildingNumber,
    delivery_postal_code: persistence.root.deliveryPostalCode,
    delivery_start_at: persistence.root.deliveryStartAt as Date,
    delivery_end_at: persistence.root.deliveryEndAt as Date,
    weight_value: persistence.root.weightValue,
    weight_unit: persistence.root.weightUnit,
    length: persistence.root.length,
    width: persistence.root.width,
    height: persistence.root.height,
    dimension_unit: persistence.root.dimensionUnit,
  };

  const roundTripped = ShipmentMapper.toDomain(entity);

  assert.equal(roundTripped.id.value, original.id.value);
  assert.equal(roundTripped.status, original.status);
  assert.equal(roundTripped.pickupCompleted, original.pickupCompleted);
  assert.equal(roundTripped.deliveryCompleted, original.deliveryCompleted);
  assert.equal(roundTripped.pickup.address.city, original.pickup.address.city);
  assert.equal(
    roundTripped.delivery.address.city,
    original.delivery.address.city,
  );
  assert.equal(roundTripped.weight.value, original.weight.value);
  assert.equal(roundTripped.dimensions.length, original.dimensions.length);
});

test("Shipment reconstitutes from a persisted id", () => {
  const shipment = ShipmentMapper.toDomain(shipmentEntity);

  assert.equal(shipment.id.equals(ShipmentId.from(shipmentEntity.id)), true);
});
