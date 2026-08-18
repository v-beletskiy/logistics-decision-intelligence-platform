import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  DimensionUnit,
  WeightUnit,
} from "../../../../shared/domain/shared-kernel/value-objects/measurement";

import { ShipmentInputMapper } from "./shipment-input.mapper";

const input = {
  pickup: {
    address: {
      country: "UA",
      city: "Kyiv",
      street: "Halytska",
      buildingNumber: "12",
      postalCode: "02000",
    },
    timeWindow: {
      start: new Date("2026-08-10T08:00:00.000Z"),
      end: new Date("2026-08-10T10:00:00.000Z"),
    },
  },
  delivery: {
    address: {
      country: "UA",
      city: "Lviv",
      street: "Horodotska",
      buildingNumber: "8",
      postalCode: "79000",
    },
    timeWindow: {
      start: new Date("2026-08-10T14:00:00.000Z"),
      end: new Date("2026-08-10T16:00:00.000Z"),
    },
  },
  weight: { value: 400, unit: WeightUnit.Kilogram },
  dimensions: {
    length: 200,
    width: 120,
    height: 150,
    unit: DimensionUnit.Centimeter,
  },
};

test("ShipmentInputMapper maps application input into domain details", () => {
  assert.deepEqual(ShipmentInputMapper.toDetails(input), input);
});
