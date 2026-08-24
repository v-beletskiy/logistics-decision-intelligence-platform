import * as assert from "node:assert/strict";
import { test } from "node:test";

import { VehicleRegistrationNumberConflictException } from "../../../app/vehicle.exceptions.js";
import type { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database.js";
import {
  DimensionUnit,
  VolumeUnit,
  WeightUnit,
} from "../../../../../../../shared/domain/value-objects/measurement/index.js";
import { CompartmentType, Vehicle } from "../../../domain/vehicle.aggregate.js";
import { insertVehicle } from "./queries/vehicle.insert.queries.js";
import { reconcileVehicleCompartments } from "./queries/vehicle.reconcile-compartments.queries.js";
import { updateVehicle } from "./queries/vehicle.update.queries.js";
import { PgVehicleRepository } from "./pg-vehicle.repository.js";

const tenantId = "00000000-0000-4000-8000-000000000010";

function createVehicle(): Vehicle {
  return Vehicle.register({
    registrationNumber: "AA-1234-BB",
    compartments: [
      {
        type: CompartmentType.DryCargo,
        capacity: {
          maxWeight: { value: 1_000, unit: WeightUnit.Kilogram },
          maxItemDimensions: {
            length: 2,
            width: 2,
            height: 2,
            unit: DimensionUnit.Meter,
          },
          maxVolume: { value: 8, unit: VolumeUnit.CubicMeter },
        },
      },
    ],
  });
}

function trackedDatabase(
  options: {
    readonly insertError?: unknown;
    readonly updateError?: unknown;
  } = {},
): {
  database: PgDatabase;
  calls: readonly unknown[];
} {
  const calls: unknown[] = [];
  const database = {
    exec: async (statement: unknown) => {
      calls.push(statement);
      if (statement === insertVehicle && options.insertError !== undefined) {
        throw options.insertError;
      }
      if (statement === updateVehicle) {
        if (options.updateError !== undefined) throw options.updateError;
        return [{ revision: "2" }];
      }
      return [];
    },
  } as unknown as PgDatabase;
  return { database, calls };
}

test("add translates the registration-number uniqueness constraint", async () => {
  const conflict = {
    code: "23505",
    constraint: "vehicles_tenant_registration_number_unique",
  };
  const { database, calls } = trackedDatabase({ insertError: conflict });

  await assert.rejects(
    new PgVehicleRepository(database).add(tenantId, createVehicle()),
    (error: unknown) => {
      assert.ok(error instanceof VehicleRegistrationNumberConflictException);
      assert.equal(error.code, "vehicle.registration-number-conflict");
      assert.equal(error.cause, conflict);
      return true;
    },
  );
  assert.deepEqual(calls, [insertVehicle]);
});

test("add propagates unknown database constraints", async () => {
  const conflict = { code: "23505", constraint: "vehicles_pkey" };
  const { database, calls } = trackedDatabase({ insertError: conflict });

  await assert.rejects(
    new PgVehicleRepository(database).add(tenantId, createVehicle()),
    (error: unknown) => error === conflict,
  );
  assert.deepEqual(calls, [insertVehicle]);
});

test("add reconciles compartments after inserting the root", async () => {
  const { database, calls } = trackedDatabase();

  await new PgVehicleRepository(database).add(tenantId, createVehicle());

  assert.deepEqual(calls, [insertVehicle, reconcileVehicleCompartments]);
});

test("save translates the registration-number uniqueness constraint", async () => {
  const conflict = {
    code: "23505",
    constraint: "vehicles_tenant_registration_number_unique",
  };
  const { database, calls } = trackedDatabase({ updateError: conflict });

  await assert.rejects(
    new PgVehicleRepository(database).save(tenantId, {
      aggregate: createVehicle(),
      expectedRevision: "1",
    }),
    VehicleRegistrationNumberConflictException,
  );
  assert.deepEqual(calls, [updateVehicle]);
});
