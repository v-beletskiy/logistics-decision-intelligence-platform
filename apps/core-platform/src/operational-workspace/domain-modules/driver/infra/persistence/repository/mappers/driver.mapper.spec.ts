import * as assert from "node:assert/strict";
import { test } from "node:test";

import { Driver, DriverStatus } from "../../../../domain/driver.aggregate";
import { DriverMapper } from "./driver.mapper";
import type { IFindDriverByIdResult } from "../queries/driver.find-by-id.queries";

const tenantId = "00000000-0000-4000-8000-000000000010";
const driverRow: IFindDriverByIdResult = {
  id: "b6154da9-3b68-4fdc-aef2-3f9196a68f79",
  first_name: "Alex",
  last_name: "Doe",
  license_number: "UA-DRIVER-001",
  depot_id: "514366f7-8429-4fc1-8cb1-4efb5c687ee1",
  phone_number: "+380501234567",
  status: "AVAILABLE",
  revision: "3",
  certifications: [
    {
      id: "00000000-0000-4000-8000-000000000011",
      type: "HAZMAT",
      credentialNumber: "HZ-123",
      validFrom: "2026-01-01T00:00:00.000Z",
      validUntil: "2027-01-01T00:00:00.000Z",
    },
  ],
};

test("DriverMapper.toDomain reconstructs a complete aggregate", () => {
  const driver = DriverMapper.toDomain(driverRow);

  assert.equal(driver.id.value, driverRow.id);
  assert.equal(driver.status, DriverStatus.Available);
  assert.equal(driver.certifications.length, 1);
  assert.equal(driver.certifications[0]?.credentialNumber, "HZ-123");
});

test("DriverMapper.toDomain translates domain-invalid child data", () => {
  assert.throws(
    () =>
      DriverMapper.toDomain({
        ...driverRow,
        certifications: [{ id: "bad" }],
      }),
    /identifier must be a valid UUID/,
  );
});

test("DriverMapper.toDomain rejects a non-text persisted timestamp", () => {
  const [certification] = driverRow.certifications as readonly Record<
    string,
    unknown
  >[];

  assert.throws(
    () =>
      DriverMapper.toDomain({
        ...driverRow,
        certifications: [{ ...certification, validFrom: 1_767_225_600_000 }],
      }),
    /Expected a timestamp string/,
  );
});

test("DriverMapper.toDomain rejects a persisted collection over the aggregate limit", () => {
  const [certification] = driverRow.certifications as readonly Record<
    string,
    unknown
  >[];
  const certifications = Array.from({ length: 11 }, (_, index) => ({
    ...certification,
    id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    type: `TYPE-${index}`,
    credentialNumber: `CREDENTIAL-${index}`,
  }));

  assert.throws(
    () => DriverMapper.toDomain({ ...driverRow, certifications }),
    /cannot have more than 10 certifications/,
  );
});

test("DriverMapper.toPersistence maps root and aggregate-owned children", () => {
  const driver = DriverMapper.toDomain(driverRow);
  const persistence = DriverMapper.toPersistence(tenantId, driver);

  assert.deepEqual(persistence.root, {
    tenantId,
    id: driverRow.id,
    firstName: "Alex",
    lastName: "Doe",
    licenseNumber: "UA-DRIVER-001",
    depotId: driverRow.depot_id,
    phoneNumber: driverRow.phone_number,
    status: DriverStatus.Available,
  });
  const certifications = persistence.certifications;
  assert.deepEqual(certifications.ids, [
    "00000000-0000-4000-8000-000000000011",
  ]);
  assert.ok(certifications.validFromDates[0] instanceof Date);
});

test("a newly registered driver maps all aggregate-owned certifications", () => {
  const driver = Driver.register({
    firstName: "Alex",
    lastName: "Doe",
    licenseNumber: "UA-DRIVER-001",
    certifications: [
      {
        type: "MEDICAL",
        credentialNumber: "MED-1",
        validFrom: new Date("2026-01-01T00:00:00Z"),
        validUntil: new Date("2027-01-01T00:00:00Z"),
      },
    ],
  });

  assert.equal(
    DriverMapper.toPersistence(tenantId, driver).certifications.types[0],
    "MEDICAL",
  );
});
