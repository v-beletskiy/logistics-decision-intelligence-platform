import * as assert from "node:assert/strict";
import { test } from "node:test";

import { DomainException } from "../../../../shared/domain/shared-kernel/domain.exceptions";
import {
  Driver,
  DriverStatus,
  MAX_DRIVER_CERTIFICATIONS,
} from "./driver.aggregate";
import { DriverCertificationId } from "./driver-certification-id";
import { DriverId } from "./driver-id";

const details = {
  firstName: "Alex",
  lastName: "Doe",
  licenseNumber: "UA-DRIVER-001",
};

function certification(index: number) {
  return {
    type: `TYPE-${index}`,
    credentialNumber: `CREDENTIAL-${index}`,
    validFrom: new Date("2026-01-01T00:00:00Z"),
    validUntil: new Date("2027-01-01T00:00:00Z"),
  };
}

test("Driver suspension requires explicit reinstatement before availability changes", () => {
  const driver = Driver.register(details);
  driver.suspend();
  assert.equal(driver.status, DriverStatus.Suspended);
  assert.throws(() => driver.markAvailable(), /must be reinstated/);
  driver.reinstate();
  assert.equal(driver.status, DriverStatus.Unavailable);
  driver.markAvailable();
  assert.equal(driver.status, DriverStatus.Available);
  assert.deepEqual(
    driver.pullDomainEvents().map((event) => event.type),
    [
      "DriverRegisteredDomainEvent",
      "DriverSuspendedDomainEvent",
      "DriverReinstatedDomainEvent",
      "DriverMarkedAvailableDomainEvent",
    ],
  );
});

test("Driver rejects an unsupported status during reconstitution", () => {
  assert.throws(
    () =>
      Driver.reconstitute(DriverId.generate(), {
        ...details,
        certifications: [],
        status: "UNKNOWN" as DriverStatus,
      }),
    /driver status is invalid/,
  );
});

test("Driver validates required and optional text values at runtime", () => {
  assert.throws(
    () => Driver.register({ ...details, firstName: 42 as unknown as string }),
    /Driver first name must be text/,
  );
  assert.throws(
    () => Driver.register({ ...details, phoneNumber: 42 as unknown as string }),
    /Driver phone number must be text when specified/,
  );
});

test("Driver owns the lifecycle of its certification entities", () => {
  const driver = Driver.register(details);
  const certificationId = driver.addCertification({
    type: "HAZMAT",
    credentialNumber: "HZ-123",
    validFrom: new Date("2026-01-01T00:00:00Z"),
    validUntil: new Date("2027-01-01T00:00:00Z"),
  });

  driver.updateCertification(certificationId, {
    type: "HAZMAT",
    credentialNumber: "HZ-123",
    validFrom: new Date("2026-01-01T00:00:00Z"),
    validUntil: new Date("2028-01-01T00:00:00Z"),
  });
  assert.equal(driver.certifications[0]?.validUntil.getUTCFullYear(), 2028);

  driver.removeCertification(certificationId);
  assert.equal(driver.certifications.length, 0);
  assert.deepEqual(
    driver.pullDomainEvents().map((event) => event.type),
    [
      "DriverRegisteredDomainEvent",
      "DriverCertificationAddedDomainEvent",
      "DriverCertificationUpdatedDomainEvent",
      "DriverCertificationRemovedDomainEvent",
    ],
  );
});

test("Driver reports a specific exception for an oversized certification field", () => {
  assert.throws(
    () =>
      Driver.register({
        ...details,
        certifications: [
          {
            ...certification(1),
            type: "A".repeat(101),
          },
        ],
      }),
    (exception) => {
      assert.ok(exception instanceof DomainException);
      assert.equal(exception.code, "driver.certification-field-too-long");
      assert.deepEqual(exception.context, { field: "type", maxLength: 100 });
      return true;
    },
  );
});

test("Driver rejects duplicate and unknown certifications", () => {
  const certification = {
    type: "HAZMAT",
    credentialNumber: "HZ-123",
    validFrom: new Date("2026-01-01T00:00:00Z"),
    validUntil: new Date("2027-01-01T00:00:00Z"),
  };
  const driver = Driver.register({
    ...details,
    certifications: [certification],
  });

  assert.throws(() => driver.addCertification(certification), /must be unique/);
  assert.throws(
    () =>
      driver.removeCertification(
        DriverCertificationId.from("00000000-0000-4000-8000-000000000099"),
      ),
    /does not belong/,
  );
});

test("Driver distinguishes certification credential pairs without delimiter encoding", () => {
  const driver = Driver.register({
    ...details,
    certifications: [
      {
        type: "A\u0000B",
        credentialNumber: "C",
        validFrom: new Date("2026-01-01T00:00:00Z"),
        validUntil: new Date("2027-01-01T00:00:00Z"),
      },
      {
        type: "A",
        credentialNumber: "B\u0000C",
        validFrom: new Date("2026-01-01T00:00:00Z"),
        validUntil: new Date("2027-01-01T00:00:00Z"),
      },
    ],
  });

  assert.equal(driver.certifications.length, 2);
});

test("Driver limits its certification collection to ten children", () => {
  const certifications = Array.from(
    { length: MAX_DRIVER_CERTIFICATIONS },
    (_, index) => certification(index),
  );
  const driver = Driver.register({ ...details, certifications });

  assert.equal(driver.certifications.length, MAX_DRIVER_CERTIFICATIONS);
  assert.throws(
    () => driver.addCertification(certification(MAX_DRIVER_CERTIFICATIONS)),
    /cannot have more than 10 certifications/,
  );
  assert.throws(
    () =>
      Driver.register({
        ...details,
        certifications: [
          ...certifications,
          certification(MAX_DRIVER_CERTIFICATIONS),
        ],
      }),
    /cannot have more than 10 certifications/,
  );
});
