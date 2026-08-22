import * as assert from "node:assert/strict";
import { test } from "node:test";

import { Address, GeoCoordinate } from ".";

test("GeoCoordinate validates geographic bounds and compares by value", () => {
  const coordinate = GeoCoordinate.create({
    latitude: 50.45,
    longitude: 30.523,
  });

  assert.ok(
    coordinate.equals(
      GeoCoordinate.create({ latitude: 50.45, longitude: 30.523 }),
    ),
  );
  assert.throws(
    () => GeoCoordinate.create({ latitude: 91, longitude: 30.523 }),
    /Latitude must be between -90 and 90/,
  );
});

test("Address normalizes required and optional text", () => {
  const address = Address.create({
    country: " Ukraine ",
    stateOrRegion: " ",
    city: " Kyiv ",
    street: " Khreshchatyk Street ",
    buildingNumber: " 1 ",
    postalCode: " 01001 ",
  });

  assert.equal(address.country, "Ukraine");
  assert.equal(address.stateOrRegion, undefined);
  assert.equal(address.city, "Kyiv");
  assert.ok(Object.isFrozen(address));
});
