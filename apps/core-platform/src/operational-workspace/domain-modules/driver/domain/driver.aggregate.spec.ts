import * as assert from "node:assert/strict";
import { test } from "node:test";

import { Driver, DriverStatus } from "./driver.aggregate";
import { DriverId } from "./driver-id";

const details = {
  firstName: "Alex",
  lastName: "Doe",
  licenseNumber: "UA-DRIVER-001",
};

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

test("Driver persistence plan marks a registration as new and a reconstitution as loaded", () => {
  assert.equal(Driver.register(details).getPersistencePlan().isNew, true);
  assert.equal(
    Driver.reconstitute(DriverId.generate(), {
      ...details,
      status: DriverStatus.Available,
    }).getPersistencePlan().isNew,
    false,
  );
});
