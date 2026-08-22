import * as assert from "node:assert/strict";
import { test } from "node:test";

import { ConcurrencyConflictException } from "../../../../../../../shared/app/app.exceptions";
import {
  Dimensions,
  DimensionUnit,
  Weight,
  WeightUnit,
} from "../../../../../../../shared/domain/value-objects/measurement";
import type { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database";
import { Shipment, ShipmentStatus } from "../../../domain/shipment.aggregate";
import { ShipmentId } from "../../../domain/shipment-id";
import { ShipmentEndpoint } from "../../../domain/shipment-endpoint.value-object";
import { PgShipmentRepository } from "./pg-shipment.repository";
import { findShipmentById } from "./queries/shipment.find-by-id.queries";
import { findShipmentsByIds } from "./queries/shipment.find-by-ids.queries";
import { insertShipment } from "./queries/shipment.insert.queries";
import { updateShipment } from "./queries/shipment.update.queries";

const tenantId = "00000000-0000-4000-8000-000000000010";

const shipmentRow = {
  id: "00000000-0000-4000-8000-000000000001",
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

function trackedDatabase(
  options: {
    readonly updateSucceeds?: boolean;
  } = {},
): {
  database: PgDatabase;
  calls: ReadonlyArray<{ statement: unknown; params: unknown }>;
} {
  const calls: Array<{ statement: unknown; params: unknown }> = [];
  const database = {
    exec: async (statement: unknown, params: unknown) => {
      calls.push({ statement, params });
      if (statement === insertShipment) {
        return [];
      }
      if (statement === updateShipment) {
        return options.updateSucceeds === false ? [] : [{ revision: "4" }];
      }
      if (statement === findShipmentById || statement === findShipmentsByIds) {
        return [shipmentRow];
      }
      return [];
    },
  } as unknown as PgDatabase;
  return { database, calls };
}

function createLoadedShipment(): {
  aggregate: Shipment;
  expectedRevision: string;
} {
  return {
    aggregate: Shipment.reconstitute(ShipmentId.from(shipmentRow.id), {
      pickup: ShipmentEndpoint.create({
        address: {
          country: "UA",
          city: "Kyiv",
          street: "Halytska",
          buildingNumber: "12",
          postalCode: "02000",
        },
        location: {
          latitude: 50.4501,
          longitude: 30.5234,
        },
        timeWindow: {
          start: new Date("2026-08-10T08:00:00.000Z"),
          end: new Date("2026-08-10T10:00:00.000Z"),
        },
      }),
      delivery: ShipmentEndpoint.create({
        address: {
          country: "UA",
          city: "Lviv",
          street: "Horodotska",
          buildingNumber: "8",
          postalCode: "79000",
        },
        location: {
          latitude: 49.8397,
          longitude: 24.0297,
        },
        timeWindow: {
          start: new Date("2026-08-10T14:00:00.000Z"),
          end: new Date("2026-08-10T16:00:00.000Z"),
        },
      }),
      weight: Weight.create({ value: 400, unit: WeightUnit.Kilogram }),
      dimensions: Dimensions.create({
        length: 200,
        width: 120,
        height: 150,
        unit: DimensionUnit.Centimeter,
      }),
      pickupCompleted: false,
      deliveryCompleted: false,
      status: ShipmentStatus.Created,
    }),
    expectedRevision: "3",
  };
}

test("add inserts the shipment root", async () => {
  const shipment = createLoadedShipment().aggregate;
  const { database, calls } = trackedDatabase();

  await new PgShipmentRepository(database).add(tenantId, shipment);

  assert.deepEqual(
    calls.map((call) => call.statement),
    [insertShipment],
  );
});

test("save uses the expected revision and returns the next one", async () => {
  const loadedShipment = createLoadedShipment();
  loadedShipment.aggregate.completePickup();
  const { database, calls } = trackedDatabase();

  const revision = await new PgShipmentRepository(database).save(
    tenantId,
    loadedShipment,
  );

  assert.equal(revision, "4");
  const update = calls[0]?.params as {
    expectedRevision: string;
    pickupCompleted: boolean;
  };
  assert.equal(update.expectedRevision, "3");
  assert.equal(update.pickupCompleted, true);
});

test("save rejects a stale aggregate", async () => {
  const { database, calls } = trackedDatabase({ updateSucceeds: false });

  await assert.rejects(
    () =>
      new PgShipmentRepository(database).save(tenantId, createLoadedShipment()),
    ConcurrencyConflictException,
  );
  assert.deepEqual(
    calls.map((call) => call.statement),
    [updateShipment],
  );
});

test("findById hydrates a loaded shipment", async () => {
  const { database, calls } = trackedDatabase();

  const loaded = await new PgShipmentRepository(database).findById(
    tenantId,
    ShipmentId.from(shipmentRow.id),
  );

  assert.equal(loaded?.expectedRevision, "3");
  assert.equal(loaded?.aggregate.status, ShipmentStatus.Created);
  assert.deepEqual(
    calls.map((call) => call.statement),
    [findShipmentById],
  );
});

test("findByIds hydrates shipment rows", async () => {
  const { database, calls } = trackedDatabase();

  const shipments = await new PgShipmentRepository(database).findByIds(
    tenantId,
    [ShipmentId.from(shipmentRow.id)],
  );

  assert.equal(shipments.length, 1);
  assert.equal(shipments[0]?.status, ShipmentStatus.Created);
  assert.deepEqual(
    calls.map((call) => call.statement),
    [findShipmentsByIds],
  );
});

test("findByIds short-circuits an empty collection", async () => {
  const { database, calls } = trackedDatabase();

  const shipments = await new PgShipmentRepository(database).findByIds(
    tenantId,
    [],
  );

  assert.deepEqual(shipments, []);
  assert.deepEqual(calls, []);
});
