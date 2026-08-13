import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { PgDatabase } from "../../../../../shared/infra/persistence/pg-database";
import {
  Compartment,
  CompartmentType,
  Vehicle,
  VehicleStatus,
} from "../../domain/vehicle.aggregate";
import { CompartmentId } from "../../domain/compartment-id";
import { VehicleId } from "../../domain/vehicle-id";
import { DimensionUnit, VolumeUnit, WeightUnit } from "../../../../../shared/domain/shared-kernel/value-objects/measurement";
import { deleteVehicleCompartments } from "./queries/vehicle.delete-compartments.queries";
import { insertVehicleCompartments } from "./queries/vehicle.insert-compartments.queries";
import { insertVehicle } from "./queries/vehicle.insert.queries";
import { updateVehicleCompartments } from "./queries/vehicle.update-compartments.queries";
import { updateVehicle } from "./queries/vehicle.update.queries";
import { PgVehicleRepository } from "./vehicle.pg-repository";

const tenantId = "00000000-0000-4000-8000-000000000099";

const capacity = {
  maxWeight: { value: 1_000, unit: WeightUnit.Kilogram },
  maxItemDimensions: { length: 400, width: 200, height: 200, unit: DimensionUnit.Centimeter },
  maxVolume: { value: 30, unit: VolumeUnit.CubicMeter },
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

function loadPersistedVehicle(): Vehicle {
  const compartment = Compartment.reconstitute(
    CompartmentId.from("00000000-0000-4000-8000-000000000011"),
    { type: CompartmentType.DryCargo, capacity },
  );
  return Vehicle.reconstitute(
    VehicleId.from("00000000-0000-4000-8000-000000000001"),
    {
      registrationNumber: "AA-1234-BB",
      compartments: [compartment],
      status: VehicleStatus.Available,
    },
  );
}

test("save inserts the header and every compartment on registration", async () => {
  const vehicle = Vehicle.register({
    registrationNumber: "AA-1234-BB",
    compartments: [
      { type: CompartmentType.DryCargo, capacity },
      { type: CompartmentType.Refrigerated, name: "Cold cargo", capacity },
    ],
  });
  const { database, calls } = trackedDatabase();
  const repository = new PgVehicleRepository(database);

  await repository.save(tenantId, vehicle);

  assert.equal(calls.filter((call) => call.statement === insertVehicle).length, 1);
  assert.equal(calls.filter((call) => call.statement === updateVehicle).length, 0);
  const insertCalls = calls.filter(
    (call) => call.statement === insertVehicleCompartments,
  );
  assert.equal(insertCalls.length, 1);
  const rows = insertCalls[0]!.params as {
    rows: ReadonlyArray<{ tenantId: string }>;
  };
  assert.equal(rows.rows.length, 2);
  assert.equal(rows.rows[0]!.tenantId, tenantId);
  assert.equal(
    calls.filter((call) => call.statement === updateVehicleCompartments).length,
    0,
  );
  assert.equal(
    calls.filter((call) => call.statement === deleteVehicleCompartments).length,
    0,
  );
});

test("save updates the header and inserts only the added compartment", async () => {
  const vehicle = loadPersistedVehicle();
  const added = vehicle.addCompartment({
    type: CompartmentType.Frozen,
    name: "Frozen cargo",
    capacity,
  });
  const { database, calls } = trackedDatabase();
  const repository = new PgVehicleRepository(database);

  await repository.save(tenantId, vehicle);

  assert.equal(calls.filter((call) => call.statement === insertVehicle).length, 0);
  assert.equal(calls.filter((call) => call.statement === updateVehicle).length, 1);
  const insertCalls = calls.filter(
    (call) => call.statement === insertVehicleCompartments,
  );
  assert.equal(insertCalls.length, 1);
  const rows = insertCalls[0]!.params as {
    rows: ReadonlyArray<{ id: string; name: string }>;
  };
  assert.equal(rows.rows.length, 1);
  assert.equal(rows.rows[0]!.id, added.value);
  assert.equal(rows.rows[0]!.name, "Frozen cargo");
  assert.equal(
    calls.filter((call) => call.statement === updateVehicleCompartments).length,
    0,
  );
  assert.equal(
    calls.filter((call) => call.statement === deleteVehicleCompartments).length,
    0,
  );
});

test("save updates the header and the changed compartment when one is updated", async () => {
  const vehicle = loadPersistedVehicle();
  const existing = vehicle.compartments[0]!.id;
  vehicle.updateCompartment(existing, {
    type: CompartmentType.Hazardous,
    name: "Hazmat cargo",
    capacity,
  });
  const { database, calls } = trackedDatabase();
  const repository = new PgVehicleRepository(database);

  await repository.save(tenantId, vehicle);

  assert.equal(calls.filter((call) => call.statement === updateVehicle).length, 1);
  const updateCalls = calls.filter(
    (call) => call.statement === updateVehicleCompartments,
  );
  assert.equal(updateCalls.length, 1);
  const rows = updateCalls[0]!.params as {
    tenantId: string;
    ownerId: string;
    rows: ReadonlyArray<{ id: string; type: string; name: string | null }>;
  };
  assert.equal(rows.tenantId, tenantId);
  assert.equal(rows.ownerId, vehicle.id.value);
  assert.equal(rows.rows.length, 1);
  assert.equal(rows.rows[0]!.id, existing.value);
  assert.equal(rows.rows[0]!.type, CompartmentType.Hazardous);
  assert.equal(rows.rows[0]!.name, "Hazmat cargo");
  assert.equal(
    calls.filter((call) => call.statement === insertVehicleCompartments).length,
    0,
  );
  assert.equal(
    calls.filter((call) => call.statement === deleteVehicleCompartments).length,
    0,
  );
});

test("save batches multiple updated compartments into a single statement", async () => {
  const vehicle = Vehicle.reconstitute(
    VehicleId.from("00000000-0000-4000-8000-000000000001"),
    {
      registrationNumber: "AA-1234-BB",
      compartments: [
        Compartment.reconstitute(
          CompartmentId.from("00000000-0000-4000-8000-000000000011"),
          { type: CompartmentType.DryCargo, capacity },
        ),
        Compartment.reconstitute(
          CompartmentId.from("00000000-0000-4000-8000-000000000012"),
          { type: CompartmentType.Refrigerated, capacity },
        ),
      ],
      status: VehicleStatus.Available,
    },
  );
  const first = vehicle.compartments[0]!.id;
  const second = vehicle.compartments[1]!.id;
  vehicle.updateCompartment(first, { type: CompartmentType.DryCargo, capacity });
  vehicle.updateCompartment(second, { type: CompartmentType.Frozen, capacity });
  const { database, calls } = trackedDatabase();
  const repository = new PgVehicleRepository(database);

  await repository.save(tenantId, vehicle);

  const updateCalls = calls.filter(
    (call) => call.statement === updateVehicleCompartments,
  );
  assert.equal(updateCalls.length, 1);
  const rows = updateCalls[0]!.params as {
    rows: ReadonlyArray<{ id: string; type: string }>;
  };
  assert.equal(rows.rows.length, 2);
  assert.equal(rows.rows[0]!.id, first.value);
  assert.equal(rows.rows[0]!.type, CompartmentType.DryCargo);
  assert.equal(rows.rows[1]!.id, second.value);
  assert.equal(rows.rows[1]!.type, CompartmentType.Frozen);
});

test("save updates the header and deletes only the removed compartment", async () => {
  const vehicle = loadPersistedVehicle();
  const removed = vehicle.addCompartment({
    type: CompartmentType.Frozen,
    capacity,
  });
  vehicle.removeCompartment(removed);
  const { database, calls } = trackedDatabase();
  const repository = new PgVehicleRepository(database);

  await repository.save(tenantId, vehicle);

  assert.equal(calls.filter((call) => call.statement === updateVehicle).length, 1);
  const deleteCalls = calls.filter(
    (call) => call.statement === deleteVehicleCompartments,
  );
  assert.equal(deleteCalls.length, 1);
  const params = deleteCalls[0]!.params as {
    tenantId: string;
    ownerId: string;
    ids: readonly string[];
  };
  assert.equal(params.tenantId, tenantId);
  assert.equal(params.ownerId, vehicle.id.value);
  assert.deepEqual(params.ids, [removed.value]);
  assert.equal(
    calls.filter((call) => call.statement === insertVehicleCompartments).length,
    0,
  );
  assert.equal(
    calls.filter((call) => call.statement === updateVehicleCompartments).length,
    0,
  );
});

test("save batches multiple removed compartments into a single delete", async () => {
  const vehicle = Vehicle.reconstitute(
    VehicleId.from("00000000-0000-4000-8000-000000000001"),
    {
      registrationNumber: "AA-1234-BB",
      compartments: [
        Compartment.reconstitute(
          CompartmentId.from("00000000-0000-4000-8000-000000000011"),
          { type: CompartmentType.DryCargo, capacity },
        ),
        Compartment.reconstitute(
          CompartmentId.from("00000000-0000-4000-8000-000000000012"),
          { type: CompartmentType.Refrigerated, capacity },
        ),
        Compartment.reconstitute(
          CompartmentId.from("00000000-0000-4000-8000-000000000013"),
          { type: CompartmentType.Frozen, capacity },
        ),
      ],
      status: VehicleStatus.Available,
    },
  );
  const first = vehicle.compartments[0]!.id;
  const second = vehicle.compartments[1]!.id;
  vehicle.removeCompartment(first);
  vehicle.removeCompartment(second);
  const { database, calls } = trackedDatabase();
  const repository = new PgVehicleRepository(database);

  await repository.save(tenantId, vehicle);

  const deleteCalls = calls.filter(
    (call) => call.statement === deleteVehicleCompartments,
  );
  assert.equal(deleteCalls.length, 1);
  const params = deleteCalls[0]!.params as { ids: readonly string[] };
  assert.deepEqual(params.ids, [first.value, second.value]);
});

test("save updates the header and skips compartment statements when only status changes", async () => {
  const vehicle = loadPersistedVehicle();
  vehicle.sendToMaintenance();
  const { database, calls } = trackedDatabase();
  const repository = new PgVehicleRepository(database);

  await repository.save(tenantId, vehicle);

  assert.equal(calls.filter((call) => call.statement === updateVehicle).length, 1);
  assert.equal(calls.filter((call) => call.statement === insertVehicle).length, 0);
  assert.equal(
    calls.filter((call) => call.statement === insertVehicleCompartments).length,
    0,
  );
  assert.equal(
    calls.filter((call) => call.statement === updateVehicleCompartments).length,
    0,
  );
  assert.equal(
    calls.filter((call) => call.statement === deleteVehicleCompartments).length,
    0,
  );
  assert.equal(vehicle.status, VehicleStatus.Maintenance);
});
