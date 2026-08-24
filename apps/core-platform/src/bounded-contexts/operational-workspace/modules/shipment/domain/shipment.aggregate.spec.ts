import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { AddressProps } from "../../../../../shared/domain/value-objects/location/address.js";
import type { GeoCoordinateProps } from "../../../../../shared/domain/value-objects/location/geo-coordinate.js";
import {
  DimensionUnit,
  type DimensionsProps,
  WeightUnit,
  type WeightProps,
} from "../../../../../shared/domain/value-objects/measurement/index.js";
import type { TimeWindowProps } from "../../../../../shared/domain/value-objects/time/index.js";

import { Shipment, ShipmentStatus } from "./shipment.aggregate.js";
import { ShipmentId } from "./shipment-id.js";
import {
  ShipmentAlreadyCancelledException,
  ShipmentCompletedCancellationException,
  ShipmentDeliveryAlreadyCompletedException,
  ShipmentDeliveryRequiresPickupException,
  ShipmentExecutionNotAllowedException,
  ShipmentModificationNotAllowedException,
  ShipmentPickupAlreadyCompletedException,
} from "./shipment.exceptions.js";

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

const location: GeoCoordinateProps = {
  latitude: 50.4501,
  longitude: 30.5234,
};

const deliveryLocation: GeoCoordinateProps = {
  latitude: 49.8397,
  longitude: 24.0297,
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
  pickup: { address, location, timeWindow },
  delivery: {
    address: deliveryAddress,
    location: deliveryLocation,
    timeWindow,
  },
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
    () =>
      Shipment.create({
        ...details,
        weight: { value: -1, unit: WeightUnit.Kilogram },
      }),
    /Weight value cannot be negative/,
  );
  assert.throws(
    () =>
      Shipment.create({
        ...details,
        pickup: { address: { ...address, city: "" }, location, timeWindow },
      }),
    /Address city must be specified/,
  );
  assert.throws(
    () =>
      Shipment.create({
        ...details,
        pickup: {
          address,
          location,
          timeWindow: { start: timeWindow.end, end: timeWindow.start },
        },
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
  assert.throws(() => shipment.completePickup(), /pickup is already completed/);

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
  assert.throws(
    () => shipment.completePickup(),
    /cancelled shipment cannot be executed/,
  );
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

test("Shipment reports stable typed exceptions for lifecycle violations", () => {
  const shipment = Shipment.create(details);

  assert.throws(
    () => shipment.completeDelivery(),
    (exception: unknown) => {
      assert.ok(exception instanceof ShipmentDeliveryRequiresPickupException);
      assert.equal(exception.code, "shipment.delivery-requires-pickup");
      return true;
    },
  );

  shipment.completePickup();
  assert.throws(
    () => shipment.completePickup(),
    (exception: unknown) => {
      assert.ok(exception instanceof ShipmentPickupAlreadyCompletedException);
      assert.equal(exception.code, "shipment.pickup-already-completed");
      return true;
    },
  );
});

test("Shipment reports distinct cancellation and terminal-state failures", () => {
  const completed = Shipment.create(details);
  completed.completePickup();
  completed.completeDelivery();
  assert.throws(
    () => completed.cancel(),
    (exception: unknown) => {
      assert.ok(exception instanceof ShipmentCompletedCancellationException);
      assert.equal(exception.code, "shipment.cancellation-of-completed");
      return true;
    },
  );
  assert.throws(
    () => completed.updateDetails(details),
    (exception: unknown) => {
      assert.ok(exception instanceof ShipmentModificationNotAllowedException);
      assert.equal(exception.code, "shipment.modification-not-allowed");
      assert.deepEqual(exception.context, { reason: "completed" });
      return true;
    },
  );
  assert.throws(
    () => completed.completePickup(),
    (exception: unknown) => {
      assert.ok(exception instanceof ShipmentExecutionNotAllowedException);
      assert.equal(exception.code, "shipment.execution-not-allowed");
      assert.deepEqual(exception.context, { reason: "completed" });
      return true;
    },
  );

  const cancelled = Shipment.create(details);
  cancelled.cancel();
  assert.throws(
    () => cancelled.cancel(),
    (exception: unknown) => {
      assert.ok(exception instanceof ShipmentAlreadyCancelledException);
      assert.equal(exception.code, "shipment.already-cancelled");
      return true;
    },
  );
  assert.throws(
    () => cancelled.updateDetails(details),
    (exception: unknown) => {
      assert.ok(exception instanceof ShipmentModificationNotAllowedException);
      assert.equal(exception.code, "shipment.modification-not-allowed");
      assert.deepEqual(exception.context, { reason: "cancelled" });
      return true;
    },
  );
});

test("Shipment reports an already completed delivery outside terminal states", () => {
  const fresh = Shipment.create(details);
  const shipment = Shipment.reconstitute(ShipmentId.generate(), {
    ...details,
    pickup: fresh.pickup,
    delivery: fresh.delivery,
    weight: fresh.weight,
    dimensions: fresh.dimensions,
    pickupCompleted: true,
    deliveryCompleted: true,
    status: ShipmentStatus.InProgress,
  });

  assert.throws(
    () => shipment.completeDelivery(),
    (exception: unknown) => {
      assert.ok(exception instanceof ShipmentDeliveryAlreadyCompletedException);
      assert.equal(exception.code, "shipment.delivery-already-completed");
      return true;
    },
  );
});
