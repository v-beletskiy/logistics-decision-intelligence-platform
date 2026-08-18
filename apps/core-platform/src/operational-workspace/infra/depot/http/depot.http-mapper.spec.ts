import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { CreateDepotRequest } from "./depot.http-contracts";
import { DepotHttpMapper } from "./depot.http-mapper";

const request: CreateDepotRequest = {
  details: {
    name: "East Depot",
    address: {
      country: "UA",
      city: "Kyiv",
      street: "Halytska",
      buildingNumber: "12",
      postalCode: "02000",
    },
    location: { latitude: 50.4501, longitude: 30.5234 },
  },
  vehicleCapacity: 20,
  driverCapacity: 10,
};

test("DepotHttpMapper converts a create depot request into details input", () => {
  const input = DepotHttpMapper.toDepotDetailsInput(request);

  assert.equal(input.name, "East Depot");
  assert.deepEqual(input.address, request.details.address);
  assert.deepEqual(input.location, request.details.location);
});

test("DepotHttpMapper maps a created depot response", () => {
  assert.deepEqual(DepotHttpMapper.toCreatedDepotResponse("depot-id"), {
    id: "depot-id",
  });
});