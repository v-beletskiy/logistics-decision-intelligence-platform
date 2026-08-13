import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { AddressProps } from "../../../../../shared/domain/shared-kernel/value-objects/location/address";
import type { PgDatabase } from "../../../../../shared/infra/persistence/pg-database";
import { Depot, DepotStatus } from "../../domain/depot.aggregate";
import { DepotId } from "../../domain/depot-id";
import { insertDepot } from "./queries/depot.insert.queries";
import { updateDepot } from "./queries/depot.update.queries";
import { PgDepotRepository } from "./depot.pg-repository";

const tenantId = "00000000-0000-4000-8000-000000000099";

const address: AddressProps = {
  country: "UA",
  stateOrRegion: "Kyiv Oblast",
  city: "Kyiv",
  street: "Halytska",
  buildingNumber: "12",
  postalCode: "02000",
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

function loadPersistedDepot(): Depot {
  return Depot.reconstitute(
    DepotId.from("00000000-0000-4000-8000-000000000001"),
    {
      name: "Kyiv Hub",
      address: Depot.create({ name: "Kyiv Hub", address }, 50, 40).address,
      vehicleCapacity: 50,
      driverCapacity: 40,
      vehicleCount: 12,
      driverCount: 7,
      status: DepotStatus.Active,
    },
  );
}

test("save inserts the depot row on registration", async () => {
  const depot = Depot.create({ name: "Kyiv Hub", address }, 50, 40);
  const { database, calls } = trackedDatabase();
  const repository = new PgDepotRepository(database);

  await repository.save(tenantId, depot);

  assert.equal(
    calls.filter((call) => call.statement === insertDepot).length,
    1,
  );
  assert.equal(
    calls.filter((call) => call.statement === updateDepot).length,
    0,
  );
  const insert = calls.find((call) => call.statement === insertDepot);
  assert.deepEqual(insert!.params, {
    tenantId,
    id: depot.id.value,
    name: "Kyiv Hub",
    country: "UA",
    stateOrRegion: "Kyiv Oblast",
    city: "Kyiv",
    street: "Halytska",
    buildingNumber: "12",
    postalCode: "02000",
    status: DepotStatus.Active,
    vehicleCapacity: 50,
    driverCapacity: 40,
    vehicleCount: 0,
    driverCount: 0,
  });
});

test("save updates the depot row when a loaded depot changes", async () => {
  const depot = loadPersistedDepot();
  depot.close();
  const { database, calls } = trackedDatabase();
  const repository = new PgDepotRepository(database);

  await repository.save(tenantId, depot);

  assert.equal(
    calls.filter((call) => call.statement === insertDepot).length,
    0,
  );
  assert.equal(
    calls.filter((call) => call.statement === updateDepot).length,
    1,
  );
  const update = calls.find((call) => call.statement === updateDepot);
  assert.deepEqual(update!.params, {
    tenantId,
    id: depot.id.value,
    name: "Kyiv Hub",
    country: "UA",
    stateOrRegion: "Kyiv Oblast",
    city: "Kyiv",
    street: "Halytska",
    buildingNumber: "12",
    postalCode: "02000",
    status: DepotStatus.Closed,
    vehicleCapacity: 50,
    driverCapacity: 40,
    vehicleCount: 12,
    driverCount: 7,
  });
});

test("save updates the depot row after occupancy changes", async () => {
  const depot = loadPersistedDepot();
  depot.receiveVehicle();
  depot.receiveDriver();
  const { database, calls } = trackedDatabase();
  const repository = new PgDepotRepository(database);

  await repository.save(tenantId, depot);

  const update = calls.find((call) => call.statement === updateDepot);
  const params = update!.params as {
    vehicleCount: number;
    driverCount: number;
  };
  assert.equal(params.vehicleCount, 13);
  assert.equal(params.driverCount, 8);
});
