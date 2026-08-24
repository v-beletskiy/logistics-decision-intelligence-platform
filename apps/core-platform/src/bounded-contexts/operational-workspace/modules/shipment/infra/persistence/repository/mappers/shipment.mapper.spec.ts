import * as assert from "node:assert/strict";
import { test } from "node:test";

import { ShipmentStatus } from "../../../../domain/shipment.aggregate.js";
import { ShipmentMapper } from "./shipment.mapper.js";
import type { IFindShipmentByIdResult } from "../queries/shipment.find-by-id.queries.js";

const tenantId = "00000000-0000-4000-8000-000000000010";

const shipmentRow: IFindShipmentByIdResult = {
  id: "b6154da9-3b68-4fdc-aef2-3f9196a68f79",
  status: "CREATED",
  pickup_completed: false,
  delivery_completed: false,
  pickup_country: "UA",
  pickup_state_or_region: null,
  pickup_city: "Kyiv",
  pickup_street: "Halytska",
  pickup_building_number: "12",
  pickup_postal_code: "02000",
  pickup_latitude: 50.4501,
  pickup_longitude: 30.5234,
  pickup_start_at: new Date("2026-08-10T08:00:00.000Z"),
  pickup_end_at: new Date("2026-08-10T10:00:00.000Z"),
  delivery_country: "UA",
  delivery_state_or_region: null,
  delivery_city: "Lviv",
  delivery_street: "Horodotska",
  delivery_building_number: "8",
  delivery_postal_code: "79000",
  delivery_latitude: 49.8397,
  delivery_longitude: 24.0297,
  delivery_start_at: new Date("2026-08-10T14:00:00.000Z"),
  delivery_end_at: new Date("2026-08-10T16:00:00.000Z"),
  weight_value: 400,
  weight_unit: "KILOGRAM",
  length: 200,
  width: 120,
  height: 150,
  dimension_unit: "CENTIMETER",
  revision: "3",
};

test("ShipmentMapper.toDomain reconstructs a complete aggregate", () => {
  const shipment = ShipmentMapper.toDomain(shipmentRow);

  assert.equal(shipment.id.value, shipmentRow.id);
  assert.equal(shipment.status, ShipmentStatus.Created);
  assert.equal(shipment.pickup.address.city, "Kyiv");
  assert.equal(shipment.pickup.location.latitude, shipmentRow.pickup_latitude);
  assert.equal(
    shipment.pickup.location.longitude,
    shipmentRow.pickup_longitude,
  );
  assert.equal(shipment.delivery.address.city, "Lviv");
  assert.equal(
    shipment.delivery.location.latitude,
    shipmentRow.delivery_latitude,
  );
  assert.equal(
    shipment.delivery.location.longitude,
    shipmentRow.delivery_longitude,
  );
  assert.equal(shipment.weight.value, 400);
  assert.equal(shipment.dimensions.height, 150);
  assert.equal(shipment.pickupCompleted, false);
  assert.equal(shipment.deliveryCompleted, false);
});

test("ShipmentMapper.toDomain rejects persisted dimension data over the domain envelope", () => {
  assert.throws(
    () => ShipmentMapper.toDomain({ ...shipmentRow, height: -1 }),
    /Dimension height must be greater than zero/,
  );
});

test("ShipmentMapper.toDomain rejects an unsupported persisted unit", () => {
  assert.throws(
    () => ShipmentMapper.toDomain({ ...shipmentRow, dimension_unit: "FOOT" }),
    /Dimension unit is invalid/,
  );
});

test("ShipmentMapper.toDomain rejects an invalid persisted status", () => {
  assert.throws(
    () => ShipmentMapper.toDomain({ ...shipmentRow, status: "UNKNOWN" }),
    /shipment status is invalid/,
  );
});

test("ShipmentMapper.toDomain rejects persisted delivery completion before pickup", () => {
  assert.throws(
    () =>
      ShipmentMapper.toDomain({
        ...shipmentRow,
        pickup_completed: false,
        delivery_completed: true,
      }),
    /pickup must be completed before the delivery/,
  );
});

test("ShipmentMapper.toPersistence maps a complete aggregate", () => {
  const shipment = ShipmentMapper.toDomain(shipmentRow);
  const persistence = ShipmentMapper.toPersistence(tenantId, shipment);

  assert.deepEqual(persistence, {
    tenantId,
    id: shipmentRow.id,
    status: ShipmentStatus.Created,
    pickupCompleted: false,
    deliveryCompleted: false,
    pickupCountry: "UA",
    pickupStateOrRegion: undefined,
    pickupCity: "Kyiv",
    pickupStreet: "Halytska",
    pickupBuildingNumber: "12",
    pickupPostalCode: "02000",
    pickupLatitude: shipmentRow.pickup_latitude,
    pickupLongitude: shipmentRow.pickup_longitude,
    pickupStartAt: shipmentRow.pickup_start_at,
    pickupEndAt: shipmentRow.pickup_end_at,
    deliveryCountry: "UA",
    deliveryStateOrRegion: undefined,
    deliveryCity: "Lviv",
    deliveryStreet: "Horodotska",
    deliveryBuildingNumber: "8",
    deliveryPostalCode: "79000",
    deliveryLatitude: shipmentRow.delivery_latitude,
    deliveryLongitude: shipmentRow.delivery_longitude,
    deliveryStartAt: shipmentRow.delivery_start_at,
    deliveryEndAt: shipmentRow.delivery_end_at,
    weightValue: 400,
    weightUnit: "KILOGRAM",
    length: 200,
    width: 120,
    height: 150,
    dimensionUnit: "CENTIMETER",
  });
});
