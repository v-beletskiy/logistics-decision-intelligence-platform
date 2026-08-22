import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { AddressProps } from "../../../../../shared/domain/value-objects/location/address";
import type { GeoCoordinateProps } from "../../../../../shared/domain/value-objects/location/geo-coordinate";

import { Depot, DepotStatus } from "./depot.aggregate";
import {
  DepotDriverCapacityExceededException,
  DepotVehicleCapacityExceededException,
} from "./depot.exceptions";
import { DepotId } from "./depot-id";

const address: AddressProps = {
  country: "UA",
  city: "Kyiv",
  street: "Halytska",
  buildingNumber: "12",
  postalCode: "02000",
};

const location: GeoCoordinateProps = {
  latitude: 50.4501,
  longitude: 30.5234,
};

const details = {
  name: "Kyiv Hub",
  address,
  location,
};

test("Depot registers active with empty occupancy and records creation", () => {
  const depot = Depot.create(details, 30, 20);

  assert.equal(depot.status, DepotStatus.Active);
  assert.equal(depot.name, "Kyiv Hub");
  assert.equal(depot.vehicleCapacity, 30);
  assert.equal(depot.driverCapacity, 20);
  assert.equal(depot.vehicleCount, 0);
  assert.equal(depot.driverCount, 0);
  assert.deepEqual(
    depot.pullDomainEvents().map((event) => event.type),
    ["DepotCreatedDomainEvent"],
  );
});

test("Depot validates required name, address and location", () => {
  assert.throws(
    () => Depot.create({ ...details, name: "" }, 10, 10),
    /Depot name must be specified/,
  );
  assert.throws(
    () =>
      Depot.create({ ...details, address: { ...address, city: "" } }, 10, 10),
    /Address city must be specified/,
  );
  assert.throws(
    () =>
      Depot.create(
        { ...details, location: { ...location, latitude: 91 } },
        10,
        10,
      ),
    /Latitude must be between -90 and 90/,
  );
});

test("Depot validates capacities at creation", () => {
  assert.throws(() => Depot.create(details, 0, 10), /greater than zero/);
  assert.throws(() => Depot.create(details, 10, 0), /greater than zero/);
  assert.throws(() => Depot.create(details, 10.5, 10), /whole number/);
  assert.throws(() => Depot.create(details, 10, 10.5), /whole number/);
});

test("Depot rejects an unsupported status during reconstitution", () => {
  assert.throws(
    () =>
      Depot.reconstitute(DepotId.generate(), {
        name: "Kyiv Hub",
        address: Depot.create(details, 10, 10).address,
        location: Depot.create(details, 10, 10).location,
        vehicleCapacity: 10,
        driverCapacity: 10,
        vehicleCount: 0,
        driverCount: 0,
        status: "UNKNOWN" as DepotStatus,
      }),
    /depot status is invalid/,
  );
});

test("Depot rejects occupancy exceeding capacity during reconstitution", () => {
  const depot = Depot.create(details, 10, 10);
  assert.throws(
    () =>
      Depot.reconstitute(DepotId.generate(), {
        name: "Kyiv Hub",
        address: depot.address,
        location: depot.location,
        vehicleCapacity: 10,
        driverCapacity: 10,
        vehicleCount: 11,
        driverCount: 0,
        status: DepotStatus.Active,
      }),
    /vehicle occupancy cannot exceed/,
  );
  assert.throws(
    () =>
      Depot.reconstitute(DepotId.generate(), {
        name: "Kyiv Hub",
        address: depot.address,
        location: depot.location,
        vehicleCapacity: 10,
        driverCapacity: 10,
        vehicleCount: 0,
        driverCount: 11,
        status: DepotStatus.Active,
      }),
    /driver occupancy cannot exceed/,
  );
});

test("Depot updates details and records the update event", () => {
  const depot = Depot.create(details, 10, 10);
  depot.pullDomainEvents();
  depot.updateDetails({ name: "Kyiv Central", address, location });

  assert.equal(depot.name, "Kyiv Central");
  assert.equal(depot.vehicleCapacity, 10);
  assert.equal(depot.driverCapacity, 10);
  assert.deepEqual(
    depot.pullDomainEvents().map((event) => event.type),
    ["DepotDetailsUpdatedDomainEvent"],
  );
});

test("Depot updates vehicle and driver capacities independently", () => {
  const depot = Depot.create(details, 10, 10);
  depot.pullDomainEvents();

  depot.updateVehicleCapacity(20);
  assert.equal(depot.vehicleCapacity, 20);
  assert.equal(depot.driverCapacity, 10);
  assert.deepEqual(
    depot.pullDomainEvents().map((event) => event.type),
    ["DepotVehicleCapacityUpdatedDomainEvent"],
  );

  depot.updateDriverCapacity(15);
  assert.equal(depot.vehicleCapacity, 20);
  assert.equal(depot.driverCapacity, 15);
  assert.deepEqual(
    depot.pullDomainEvents().map((event) => event.type),
    ["DepotDriverCapacityUpdatedDomainEvent"],
  );
});

test("Depot validates capacities on update", () => {
  const depot = Depot.create(details, 10, 10);
  assert.throws(() => depot.updateVehicleCapacity(0), /greater than zero/);
  assert.throws(() => depot.updateDriverCapacity(10.5), /whole number/);
});

test("Depot rejects a capacity below its current occupancy", () => {
  const vehicleDepot = Depot.create(details, 10, 10);
  vehicleDepot.receiveVehicle();
  vehicleDepot.receiveVehicle();
  vehicleDepot.pullDomainEvents();
  assert.throws(
    () => vehicleDepot.updateVehicleCapacity(1),
    (exception) => {
      assert.ok(exception instanceof DepotVehicleCapacityExceededException);
      assert.deepEqual(exception.context, {
        vehicleCount: 2,
        vehicleCapacity: 1,
      });
      return true;
    },
  );
  assert.equal(vehicleDepot.vehicleCapacity, 10);
  assert.deepEqual(vehicleDepot.pullDomainEvents(), []);

  const driverDepot = Depot.create(details, 10, 10);
  driverDepot.receiveDriver();
  driverDepot.receiveDriver();
  driverDepot.pullDomainEvents();
  assert.throws(
    () => driverDepot.updateDriverCapacity(1),
    (exception) => {
      assert.ok(exception instanceof DepotDriverCapacityExceededException);
      assert.deepEqual(exception.context, {
        driverCount: 2,
        driverCapacity: 1,
      });
      return true;
    },
  );
  assert.equal(driverDepot.driverCapacity, 10);
  assert.deepEqual(driverDepot.pullDomainEvents(), []);
});

test("Depot transitions between active and inactive states", () => {
  const depot = Depot.create(details, 10, 10);
  assert.equal(depot.status, DepotStatus.Active);
  assert.throws(() => depot.activate(), /already active/);

  depot.inactivate();
  assert.equal(depot.status, DepotStatus.Inactive);
  assert.throws(() => depot.inactivate(), /already inactive/);

  depot.activate();
  assert.equal(depot.status, DepotStatus.Active);
});

test("Depot close is a terminal transition", () => {
  const depot = Depot.create(details, 10, 10);
  depot.close();
  assert.equal(depot.status, DepotStatus.Closed);
  assert.throws(() => depot.close(), /already closed/);
  assert.throws(() => depot.activate(), /closed depot cannot be changed/);
  assert.throws(() => depot.inactivate(), /closed depot cannot be changed/);
  assert.throws(
    () => depot.updateDetails(details),
    /closed depot cannot be changed/,
  );
  assert.throws(
    () => depot.updateVehicleCapacity(20),
    /closed depot cannot be changed/,
  );
  assert.throws(
    () => depot.updateDriverCapacity(20),
    /closed depot cannot be changed/,
  );
});

test("Depot receives vehicles and drivers up to their own capacities", () => {
  const depot = Depot.create(details, 2, 2);

  depot.receiveVehicle();
  depot.receiveVehicle();
  depot.receiveDriver();
  assert.equal(depot.vehicleCount, 2);
  assert.equal(depot.driverCount, 1);
  assert.equal(depot.isFullOfVehicles, true);
  assert.equal(depot.isFullOfDrivers, false);

  assert.throws(
    () => depot.receiveVehicle(),
    /cannot receive new vehicles when it is full/,
  );

  depot.receiveDriver();
  assert.equal(depot.isFullOfDrivers, true);
  assert.throws(
    () => depot.receiveDriver(),
    /cannot receive new drivers when it is full/,
  );

  depot.releaseVehicle();
  assert.equal(depot.isFullOfVehicles, false);
  depot.receiveVehicle();
  assert.equal(depot.vehicleCount, 2);
  assert.equal(depot.occupantCount, 4);
});

test("Depot rejects receiving resources when not active", () => {
  const inactive = Depot.create(details, 10, 10);
  inactive.inactivate();
  assert.throws(() => inactive.receiveVehicle(), /Only an active depot/);
  assert.throws(() => inactive.receiveDriver(), /Only an active depot/);

  const closed = Depot.create(details, 10, 10);
  closed.close();
  assert.throws(() => closed.receiveVehicle(), /Only an active depot/);
});

test("Depot releases vehicles and drivers only when present", () => {
  const depot = Depot.create(details, 10, 10);
  assert.throws(() => depot.releaseVehicle(), /no vehicles to release/);
  assert.throws(() => depot.releaseDriver(), /no drivers to release/);

  depot.receiveVehicle();
  depot.receiveDriver();
  depot.releaseVehicle();
  depot.releaseDriver();
  assert.equal(depot.vehicleCount, 0);
  assert.equal(depot.driverCount, 0);
});
