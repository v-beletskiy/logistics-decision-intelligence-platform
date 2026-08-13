import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { AddressProps } from "../../../../shared/domain/shared-kernel/value-objects/location/address";
import {
  DimensionUnit,
  type DimensionsProps,
  WeightUnit,
  type WeightProps,
} from "../../../../shared/domain/shared-kernel/value-objects/measurement";
import type { TimeWindowProps } from "../../../../shared/domain/shared-kernel/value-objects/time";

import { Shipment, ShipmentStatus } from "./shipment.aggregate";
import { ShipmentId } from "./shipment-id";

const address: AddressProps = {
  country: "UA",
  city: "Kyiv",
  street: "Halytska",
  buildingNumber: "12",
  postalCode: "02000",
};

const deliveryAddress: AddressProps = {
  country: "UA",
  city: "Lviv",
  street: "Horodotska",
  buildingNumber: "8",
  postalCode: "79000",
};

const timeWindow: TimeWindowProps = {
  start: new Date("2026-08-10T08:00:00.000Z"),
  end: new Date("2026-08-10T10:00:00.000Z"),
};

const weight: WeightProps = { value: 400, unit: WeightUnit.Kilogram };
const dimensions: DimensionsProps = {
  length: 200,
  width: 120,
  height: 150,
  unit: DimensionUnit.Centimeter,
};

const details = {
  pickup: { address, timeWindow },
  delivery: { address: deliveryAddress, timeWindow },
  weight,
  dimensions,
};

test("Shipment registers as created with pending endpoints", () => {
  const shipment = Shipment.create(details);

  assert.equal(shipment.status, ShipmentStatus.Created);
  assert.equal(shipment.pickupCompleted, false);
  assert.equal(shipment.deliveryCompleted, false);
  assert.equal(shipment.pickup.address.city, "Kyiv");
  assert.equal(shipment.delivery.address.city, "Lviv");
  assert.equal(shipment.weight.value, 400);
  assert.equal(shipment.weight.unit, WeightUnit.Kilogram);
  assert.equal(shipment.dimensions.length, 200);
  assert.deepEqual(
    shipment.pullDomainEvents().map((event) => event.type),
    ["ShipmentCreatedDomainEvent"],
  );
});

test("Shipment validates required endpoint, weight and dimensions", () => {
  assert.throws(
    () => Shipment.create({ ...details, weight: { value: -1, unit: WeightUnit.Kilogram } }),
    /Weight value cannot be negative/,
  );
  assert.throws(
    () =>
      Shipment.create({
        ...details,
        pickup: { address: { ...address, city: "" }, timeWindow },
      }),
    /Address city must be specified/,
  );
  assert.throws(
    () =>
      Shipment.create({
        ...details,
        pickup: { address, timeWindow: { start: timeWindow.end, end: timeWindow.start } },
      }),
    /time window start cannot be later/,
  );
  assert.throws(
    () => Shipment.create({ ...details, pickup: undefined as never }),
    /Shipment endpoint properties must be specified/,
  );
});

test("Shipment rejects an unsupported status during reconstitution", () => {
  const shipment = Shipment.create(details);
  assert.throws(
    () =>
      Shipment.reconstitute(ShipmentId.generate(), {
        ...details,
        pickup: shipment.pickup,
        delivery: shipment.delivery,
        weight: shipment.weight,
        dimensions: shipment.dimensions,
        pickupCompleted: false,
        deliveryCompleted: false,
        status: "UNKNOWN" as ShipmentStatus,
      }),
    /shipment status is invalid/,
  );
});

test("Shipment rejects persisted delivery completion before pickup completion", () => {
  const shipment = Shipment.create(details);
  assert.throws(
    () =>
      Shipment.reconstitute(ShipmentId.generate(), {
        ...details,
        pickup: shipment.pickup,
        delivery: shipment.delivery,
        weight: shipment.weight,
        dimensions: shipment.dimensions,
        pickupCompleted: false,
        deliveryCompleted: true,
        status: ShipmentStatus.Completed,
      }),
    /pickup must be completed before the delivery/,
  );
});

test("Shipment completes delivery only after pickup and completes the shipment", () => {
  const shipment = Shipment.create(details);
  shipment.pullDomainEvents();
  assert.throws(
    () => shipment.completeDelivery(),
    /pickup must be completed before the delivery/,
  );

  shipment.completePickup();
  assert.equal(shipment.pickupCompleted, true);
  assert.throws(
    () => shipment.completePickup(),
    /pickup is already completed/,
  );

  shipment.completeDelivery();
  assert.equal(shipment.deliveryCompleted, true);
  assert.equal(shipment.status, ShipmentStatus.Completed);
  assert.deepEqual(
    shipment.pullDomainEvents().map((event) => event.type),
    ["PickupCompletedDomainEvent", "DeliveryCompletedDomainEvent"],
  );
});

test("Shipment cannot be modified or executed after completion", () => {
  const shipment = Shipment.create(details);
  shipment.completePickup();
  shipment.completeDelivery();

  assert.throws(() => shipment.updateDetails(details), /completed shipment/);
  assert.throws(() => shipment.completePickup(), /completed shipment/);
  assert.throws(() => shipment.cancel(), /completed shipment/);
});

test("Shipment cancellation is terminal", () => {
  const shipment = Shipment.create(details);
  shipment.cancel();
  assert.equal(shipment.status, ShipmentStatus.Cancelled);
  assert.throws(() => shipment.cancel(), /already cancelled/);
  assert.throws(() => shipment.updateDetails(details), /cancelled shipment/);
  assert.throws(() => shipment.completePickup(), /cancelled shipment cannot be executed/);
});

test("Shipment updates details while mutable", () => {
  const shipment = Shipment.create(details);
  shipment.pullDomainEvents();
  const updated = {
    ...details,
    weight: { value: 500, unit: WeightUnit.Kilogram },
  };
  shipment.updateDetails(updated);

  assert.equal(shipment.weight.value, 500);
  assert.deepEqual(
    shipment.pullDomainEvents().map((event) => event.type),
    ["ShipmentDetailsUpdatedDomainEvent"],
  );
});
