import * as assert from "node:assert/strict";
import { test } from "node:test";

import { DriverStatus } from "../../domain/driver.aggregate";
import { DriverHttpMapper } from "./driver.http-mapper";

test("DriverHttpMapper maps a registration request into application input", () => {
  const input = DriverHttpMapper.toRegisterDriverInput({
    firstName: "Ada",
    lastName: "Grey",
    licenseNumber: "DL-1",
    certifications: [
      {
        type: "HAZMAT",
        credentialNumber: "HZ-1",
        validFrom: "2026-01-01T00:00:00.000Z",
        validUntil: "2027-01-01T00:00:00.000Z",
      },
    ],
  });

  assert.equal(input.firstName, "Ada");
  assert.equal(
    input.certifications?.[0]?.validFrom.toISOString(),
    "2026-01-01T00:00:00.000Z",
  );
  assert.equal(
    input.certifications?.[0]?.validUntil.toISOString(),
    "2027-01-01T00:00:00.000Z",
  );
});

test("DriverHttpMapper supplies application defaults and preserves status", () => {
  assert.deepEqual(
    DriverHttpMapper.toSearchDriversQueryInput({
      status: DriverStatus.Available,
    }),
    {
      mode: "page",
      page: undefined,
      pageSize: undefined,
      cursor: undefined,
      status: DriverStatus.Available,
      depotId: undefined,
      lastNamePrefix: undefined,
      certificationType: undefined,
      sortBy: undefined,
      direction: undefined,
    },
  );
});

test("DriverHttpMapper maps application results into transport responses", () => {
  const response = DriverHttpMapper.toSearchDriversResponse({
    mode: "page",
    items: [
      {
        id: "00000000-0000-4000-8000-000000000001",
        firstName: "Ada",
        lastName: "Grey",
        licenseNumber: "DL-1",
        status: DriverStatus.Available,
        certifications: [],
      },
    ],
    page: 1,
    pageSize: 25,
    totalItems: 1,
    totalPages: 1,
  });

  assert.deepEqual(response, {
    mode: "page",
    items: [
      {
        id: "00000000-0000-4000-8000-000000000001",
        firstName: "Ada",
        lastName: "Grey",
        licenseNumber: "DL-1",
        depotId: undefined,
        phoneNumber: undefined,
        status: DriverStatus.Available,
        certifications: [],
      },
    ],
    page: 1,
    pageSize: 25,
    totalItems: 1,
    totalPages: 1,
  });
});
