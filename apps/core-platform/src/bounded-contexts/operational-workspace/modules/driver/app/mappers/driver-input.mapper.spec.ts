import * as assert from "node:assert/strict";
import { test } from "node:test";

import { DriverInputMapper } from "./driver-input.mapper";

test("DriverInputMapper converts application identifiers at the domain boundary", () => {
  const details = DriverInputMapper.toRegistrationDetails({
    firstName: "Alex",
    lastName: "Doe",
    licenseNumber: "UA-DRIVER-001",
    depotId: "550e8400-e29b-41d4-a716-446655440000",
    certifications: [
      {
        type: "HAZMAT",
        credentialNumber: "HZ-1",
        validFrom: new Date("2026-01-01T00:00:00Z"),
        validUntil: new Date("2027-01-01T00:00:00Z"),
      },
    ],
  });

  assert.equal(details.depotId?.value, "550e8400-e29b-41d4-a716-446655440000");
  assert.equal(details.certifications?.[0]?.credentialNumber, "HZ-1");
});
