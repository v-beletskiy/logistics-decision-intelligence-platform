import * as assert from "node:assert/strict";
import { test } from "node:test";

import { DriverLicenseNumberConflictException } from "../../../app/driver.exceptions";
import { ConcurrencyConflictException } from "../../../../../../../shared/app/app.exceptions";
import type { PgDatabase } from "../../../../../../../shared/infra/persistence/pg-database";
import { Driver, DriverStatus } from "../../../domain/driver.aggregate";
import { DriverId } from "../../../domain/driver-id";
import { findDriverByIdForUpdate } from "./queries/driver.find-by-id-for-update.queries";
import { findDriverById } from "./queries/driver.find-by-id.queries";
import { insertDriver } from "./queries/driver.insert.queries";
import { reconcileDriverCertifications } from "./queries/driver.reconcile-certifications.queries";
import { updateDriver } from "./queries/driver.update.queries";
import { PgDriverRepository } from "./pg-driver.repository";

const tenantId = "00000000-0000-4000-8000-000000000010";

function trackedDatabase(
  options: {
    readonly updateSucceeds?: boolean;
    readonly insertError?: unknown;
  } = {},
): {
  database: PgDatabase;
  calls: ReadonlyArray<{ statement: unknown; params: unknown }>;
} {
  const calls: Array<{ statement: unknown; params: unknown }> = [];
  const database = {
    exec: async (statement: unknown, params: unknown) => {
      calls.push({ statement, params });
      if (statement === insertDriver) {
        if (options.insertError !== undefined) throw options.insertError;
        return [];
      }
      if (statement === updateDriver) {
        return options.updateSucceeds === false ? [] : [{ revision: "4" }];
      }
      if (
        statement === findDriverById ||
        statement === findDriverByIdForUpdate
      ) {
        return [
          {
            id: "00000000-0000-4000-8000-000000000001",
            first_name: "Alex",
            last_name: "Doe",
            license_number: "UA-DRIVER-001",
            depot_id: null,
            phone_number: null,
            status: "AVAILABLE",
            revision: "3",
            certifications: [],
          },
        ];
      }
      return [{ upsertedCount: 0, deletedCount: 0 }];
    },
  } as unknown as PgDatabase;
  return { database, calls };
}

function createLoadedDriver(): {
  aggregate: Driver;
  expectedRevision: string;
} {
  return {
    aggregate: Driver.reconstitute(
      DriverId.from("00000000-0000-4000-8000-000000000001"),
      {
        firstName: "Alex",
        lastName: "Doe",
        licenseNumber: "UA-DRIVER-001",
        certifications: [],
        status: DriverStatus.Available,
      },
    ),
    expectedRevision: "3",
  };
}

test("add inserts the root and reconciles all children", async () => {
  const driver = Driver.register({
    firstName: "Alex",
    lastName: "Doe",
    licenseNumber: "UA-DRIVER-001",
    certifications: [
      {
        type: "HAZMAT",
        credentialNumber: "HZ-1",
        validFrom: new Date("2026-01-01T00:00:00Z"),
        validUntil: new Date("2027-01-01T00:00:00Z"),
      },
    ],
  });
  const { database, calls } = trackedDatabase();

  await new PgDriverRepository(database).add(tenantId, driver);

  assert.deepEqual(
    calls.map((call) => call.statement),
    [insertDriver, reconcileDriverCertifications],
  );
});

test("add translates only the known license uniqueness constraint", async () => {
  const driver = Driver.register({
    firstName: "Alex",
    lastName: "Doe",
    licenseNumber: "UA-DRIVER-001",
  });
  const conflict = {
    code: "23505",
    constraint: "drivers_tenant_license_number_unique",
  };
  const { database, calls } = trackedDatabase({ insertError: conflict });

  await assert.rejects(
    new PgDriverRepository(database).add(tenantId, driver),
    (error: unknown) => {
      assert.ok(error instanceof DriverLicenseNumberConflictException);
      assert.equal(error.code, "driver.license-number-conflict");
      assert.equal(error.cause, conflict);
      return true;
    },
  );
  assert.deepEqual(
    calls.map((call) => call.statement),
    [insertDriver],
  );
});

test("save uses the expected revision before reconciling children", async () => {
  const loadedDriver = createLoadedDriver();
  loadedDriver.aggregate.markUnavailable();
  const { database, calls } = trackedDatabase();

  const revision = await new PgDriverRepository(database).save(
    tenantId,
    loadedDriver,
  );

  assert.equal(revision, "4");
  const update = calls[0]?.params as { expectedRevision: string };
  assert.equal(update.expectedRevision, "3");
  assert.deepEqual(
    calls.map((call) => call.statement),
    [updateDriver, reconcileDriverCertifications],
  );
});

test("save rejects a stale aggregate and does not touch children", async () => {
  const { database, calls } = trackedDatabase({ updateSucceeds: false });

  await assert.rejects(
    () => new PgDriverRepository(database).save(tenantId, createLoadedDriver()),
    ConcurrencyConflictException,
  );
  assert.deepEqual(
    calls.map((call) => call.statement),
    [updateDriver],
  );
});

test("pessimistic loading locks and hydrates in one query", async () => {
  const inside = trackedDatabase();
  const loadedDriver = await new PgDriverRepository(
    inside.database,
  ).findByIdForUpdate(
    tenantId,
    DriverId.from("00000000-0000-4000-8000-000000000001"),
  );
  assert.equal(loadedDriver?.expectedRevision, "3");
  assert.deepEqual(
    inside.calls.map((call) => call.statement),
    [findDriverByIdForUpdate],
  );
});
