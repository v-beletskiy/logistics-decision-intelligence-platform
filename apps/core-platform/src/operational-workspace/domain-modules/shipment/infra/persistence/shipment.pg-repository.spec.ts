import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { AddressProps } from "../../../../../shared/domain/shared-kernel/value-objects/location/address";
import {
  DimensionUnit,
  type DimensionsProps,
  WeightUnit,
  type WeightProps,
} from "../../../../../shared/domain/shared-kernel/value-objects/measurement";
import type { PgDatabase } from "../../../../../shared/infra/persistence/pg-database";
import {
  Shipment,
  ShipmentStatus,
  type ShipmentProps,
} from "../../domain/shipment.aggregate";
import { ShipmentId } from "../../domain/shipment-id";
import { ShipmentEndpoint } from "../../domain/shipment-endpoint.value-object";
import {
  Dimensions,
  Weight,
} from "../../../../../shared/domain/shared-kernel/value-objects/measurement";
import { insertShipment } from "./queries/shipment.insert.queries";
import { findShipmentsByIds } from "./queries/shipment.find-by-ids.queries";
import { updateShipment } from "./queries/shipment.update.queries";
import { PgShipmentRepository } from "./shipment.pg-repository";

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

function trackedDatabase(): {
  database: PgDatabase;
  calls: ReadonlyArray<{ statement: unknown; params: unknown }>;
} {
  const calls: Array<{ statement: unknown; params: unknown }> = [];
  const database = {
    exec: async (statement: unknown, params: unknown) => {
      calls.push({ statement, params });
      return [];
    },
  } as unknown as PgDatabase;
  return { database, calls };
}

function loadPersistedShipment(): Shipment {
  return Shipment.reconstitute(
    ShipmentId.from("00000000-0000-4000-8000-000000000001"),
    {
      pickup: ShipmentEndpoint.create({
        address: pickupAddress,
        timeWindow: {
          start: new Date("2026-08-01T08:00:00Z"),
          end: new Date("2026-08-01T10:00:00Z"),
        },
      }),
      delivery: ShipmentEndpoint.create({
        address: deliveryAddress,
        timeWindow: {
          start: new Date("2026-08-01T14:00:00Z"),
          end: new Date("2026-08-01T18:00:00Z"),
        },
      }),
      weight: Weight.create(weight),
      dimensions: Dimensions.create(dimensions),
      pickupCompleted: false,
      deliveryCompleted: false,
      status: ShipmentStatus.Planned,
    } satisfies ShipmentProps,
  );
}

test("save inserts the shipment row on registration", async () => {
  const shipment = Shipment.create(shipmentDetails);
  const { database, calls } = trackedDatabase();
  const repository = new PgShipmentRepository(database);

  await repository.save(tenantId, shipment);

  assert.equal(
    calls.filter((call) => call.statement === insertShipment).length,
    1,
  );
  assert.equal(
    calls.filter((call) => call.statement === updateShipment).length,
    0,
  );
  const insert = calls.find((call) => call.statement === insertShipment);
  const params = insert!.params as {
    tenantId: string;
    id: string;
    status: string;
    weightValue: number;
  };
  assert.equal(params.tenantId, tenantId);
  assert.equal(params.id, shipment.id.value);
  assert.equal(params.status, ShipmentStatus.Created);
  assert.equal(params.weightValue, weight.value);
});

test("save updates the shipment row when a loaded shipment changes", async () => {
  const shipment = loadPersistedShipment();
  shipment.completePickup();
  const { database, calls } = trackedDatabase();
  const repository = new PgShipmentRepository(database);

  await repository.save(tenantId, shipment);

  assert.equal(
    calls.filter((call) => call.statement === insertShipment).length,
    0,
  );
  assert.equal(
    calls.filter((call) => call.statement === updateShipment).length,
    1,
  );
  const update = calls.find((call) => call.statement === updateShipment);
  const params = update!.params as { pickupCompleted: boolean };
  assert.equal(params.pickupCompleted, true);
});

test("save updates the shipment row after delivery completion", async () => {
  const shipment = loadPersistedShipment();
  shipment.completePickup();
  shipment.completeDelivery();
  const { database, calls } = trackedDatabase();
  const repository = new PgShipmentRepository(database);

  await repository.save(tenantId, shipment);

  const update = calls.find((call) => call.statement === updateShipment);
  const params = update!.params as {
    deliveryCompleted: boolean;
    status: string;
  };
  assert.equal(params.deliveryCompleted, true);
  assert.equal(params.status, ShipmentStatus.Completed);
});

test("findByIds unwraps shipment identifiers only at the persistence boundary", async () => {
  const { database, calls } = trackedDatabase();
  const repository = new PgShipmentRepository(database);
  const shipmentIds = [
    ShipmentId.from("00000000-0000-4000-8000-000000000002"),
    ShipmentId.from("00000000-0000-4000-8000-000000000003"),
  ];

  const shipments = await repository.findByIds(tenantId, shipmentIds);

  assert.deepEqual(shipments, []);
  assert.deepEqual(calls, [
    {
      statement: findShipmentsByIds,
      params: { tenantId, ids: shipmentIds.map((id) => id.value) },
    },
  ]);
});
